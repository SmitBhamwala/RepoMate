import { Octokit } from "octokit";
import { db } from "./db";
import { aiCommitSummarizer } from "./gemini";

export const octokit = new Octokit({
	auth: process.env.GITHUB_TOKEN
});

type Response = {
	commitHash: string;
	commitMessage: string;
	commitAuthorName: string;
	commitAuthorAvatar: string;
	commitDate: string;
	// summary: string;
};

export async function getCommitHashes(gitHubURL: string): Promise<Response[]> {
	const [owner, repo] = gitHubURL.split("/").slice(-2);

	if (!owner || !repo) {
		throw new Error("Invalid GitHub URL!");
	}

	const { data } = await octokit.rest.repos.listCommits({
		owner: owner,
		repo: repo
	});

	const sortedCommits = data.sort(
		(a: any, b: any) =>
			new Date(b.commit.author?.date).getTime() -
			new Date(a.commit.author?.date).getTime()
	) as any[];

	// const response = await octokit.request(`GET /repos/${owner}/${repo}/commits`);

	return sortedCommits.slice(0, 10).map((commit) => ({
		commitHash: commit.sha as string,
		commitMessage: commit.commit.message ?? "",
		commitAuthorName: commit.commit.author.name ?? "",
		commitAuthorAvatar: commit.author.avatar_url ?? "",
		commitDate: commit.commit.author.date ?? ""
	}));
}

export async function pollCommits(projectId: string) {
	const { project, gitHubURL } = await fetchProjectGithubUrl(projectId);
	const commitHashes = await getCommitHashes(gitHubURL);
	const unprocessedCommits = await filterUnprocessedCommits(
		projectId,
		commitHashes
	);

	const summaryResponses = await Promise.allSettled(
		unprocessedCommits.map((commit) => {
			return summarizeCommit(gitHubURL, commit.commitHash);
		})
	);

	const summaries = summaryResponses.map((response) => {
		if (response.status === "fulfilled") {
			return response.value as string;
		}

		return "";
	});

	const commits = await db.commits.createMany({
		data: summaries.map((summary, index) => {
			return {
				projectId: projectId,
				commitHash: unprocessedCommits[index].commitHash,
				commitMessage: unprocessedCommits[index].commitMessage,
				commitAuthorName: unprocessedCommits[index].commitAuthorName,
				commitAuthorAvatar: unprocessedCommits[index].commitAuthorAvatar,
				commitDate: unprocessedCommits[index].commitDate,
				summary
			};
		})
	});

	return unprocessedCommits;
}

async function summarizeCommit(gitHubURL: string, commitHash: string) {
	const response = await fetch(`${gitHubURL}/commit/${commitHash}.diff`, {
		cache: "no-store",
		headers: {
			Accept: "application/vnd.github.v3.diff"
		}
	});

	const commitDiff = await response.text();

	return (await aiCommitSummarizer(commitDiff)) || "";
}

async function fetchProjectGithubUrl(projectId: string) {
	const project = await db.project.findUnique({
		where: { id: projectId },
		select: { gitHubURL: true }
	});

	if (!project?.gitHubURL) {
		throw new Error("Project has no GitHub url!");
	}

	return { project, gitHubURL: project?.gitHubURL };
}

async function filterUnprocessedCommits(
	projectId: string,
	commitHashes: Response[]
) {
	const processedCommits = await db.commits.findMany({
		where: { projectId }
	});

	const unprocessedCommits = commitHashes.filter(
		(commit) =>
			!processedCommits.some(
				(processedCommit) => processedCommit.commitHash === commit.commitHash
			)
	);

	return unprocessedCommits;
}
