import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { generateAiTextToVectorEmbedding, summarizeCode } from "./gemini";
import { db } from "./db";
import { Octokit } from "octokit";

export async function getFileCount(
	path: string,
	octokit: Octokit,
	owner: string,
	repo: string,
	acc: number = 0
) {
	const { data } = await octokit.rest.repos.getContent({
		owner,
		repo,
		path
	});
	if (!Array.isArray(data) && data.type === "file") {
		return acc + 1;
	}
	if (Array.isArray(data)) {
		let fileCount = 0;
		const directories: string[] = [];
		for (const item of data) {
			if (item.type === "dir") {
				directories.push(item.path);
			} else if (item.type === "file") {
				fileCount++;
			}
		}
		if (directories.length > 0) {
			const directoryCounts = await Promise.all(
				directories.map((dirPath) =>
					getFileCount(dirPath, octokit, owner, repo, 0)
				)
			);
			fileCount += directoryCounts.reduce((acc, count) => acc + count, 0);
		}
		return acc + fileCount;
	}
	return acc;
}

export async function checkCredits(gitHubURL: string, gitHubToken?: string) {
	const octokit = new Octokit({
		auth: gitHubToken
	});
	const [owner, repo] = gitHubURL.split("/").slice(-2);

	if (!owner || !repo) {
		return 0;
	}
	const fileCount = await getFileCount("", octokit, owner, repo, 0);
	return fileCount;
}

export async function loadGitHubRepo(githubUrl: string, gitHubToken?: string) {
	const loader = new GithubRepoLoader(githubUrl, {
		accessToken: gitHubToken || "",
		branch: "main",
		ignoreFiles: [
			"package-lock.json",
			"yarn.lock",
			"pnpm-lock.yaml",
			"bun.lockb",
			"*.lock"
		],
		recursive: true,
		unknown: "warn",
		maxConcurrency: 50
	});

	const docs = await loader.load();

	return docs;
}

export async function indexGitHubRepo(
	projectId: string,
	githubUrl: string,
	gitHubToken?: string
) {
	const docs = await loadGitHubRepo(githubUrl, gitHubToken);
	const allEmbeddings = await generateEmbeddings(docs);
	await Promise.allSettled(
		allEmbeddings.map(async (embedding) => {
			if (!embedding) return;

			await db.sourceCodeEmbeddings.create({
				data: {
					summary: embedding.summary,
					sourceCode: embedding.sourceCode,
					fileName: embedding.fileName,
					summaryEmbedding: embedding.embedding,
					projectId
				}
			});
		})
	);
}

async function generateEmbeddings(docs: Document[]) {
	return await Promise.all(
		docs.map(async (doc) => {
			const summary = await summarizeCode(doc);
			const embedding = await generateAiTextToVectorEmbedding(summary);
			console.log(doc.metadata);
			return {
				summary,
				embedding,
				sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
				fileName: doc.metadata.source
			};
		})
	);
}
