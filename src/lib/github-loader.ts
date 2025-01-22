import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { generateAiTextToVectorEmbedding, summarizeCode } from "./gemini";
import { db } from "./db";

export async function loadGitHubRepo(githubUrl: string, gitHubToken?: string) {
	const loader = new GithubRepoLoader(githubUrl, {
		accessToken: gitHubToken || "",
		branch: "main",
		ignoreFiles: [
			"package-lock.json",
			"yarn.lock",
			"pnpm-lock.yaml",
			"bun.lockb"
		],
		recursive: true,
		unknown: "warn",
		maxConcurrency: 5
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
		allEmbeddings.map(async (embedding, index) => {
			if (!embedding) return;

			const sourceCodeEmbedding = await db.sourceCodeEmbeddings.create({
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
			return {
				summary,
				embedding,
				sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
				fileName: doc.metadata.source
			};
		})
	);
}
