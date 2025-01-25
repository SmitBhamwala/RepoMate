import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";

const commitGenAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_1!);
const commitSummaryModel = commitGenAI.getGenerativeModel({
	model: "gemini-1.5-flash"
});

const codeSummaryGenAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_2!);
const codeSummaryModel = codeSummaryGenAI.getGenerativeModel({
	model: "gemini-1.5-flash"
});

export async function aiCommitSummarizer(diff: string) {
	const commitSummaryPrompt = `You are an expert programmer, and you are trying to summarize a git diff.

Reminders about the git diff format:
For every file, there are a few metadata lines, for example:

\'\'\'
diff --git a/lib/index.js b/lib/index.js
index aadf691..bfef603 100644
--- a/lib/index. js
+++ b/1ib/index.js
\'\'\'

This means that \'lib/index.js\' was modified in this commit. Note that this is only an example.
Then there is a specifier of the lines that were modified.
A line starting with \'+\' means it was added.
A line starting with \'-\' means that line was deleted.
A line that starts with neither \'+\' nor \'-\' is code given for context and better understanding.
It is not part of the diff.
[...]
EXAMPLE SUMMARY COMMENTS:
\'\'\'
⁕ Raised the amount of returned recordings from \'10\' to \'100\'[packages/server/recordings_api.ts], [packages/server/constants.ts]
⁕ Fixed a typo in the github action name [.github/workflows/gpt-commit-summarizer.yml]
⁕ Moved the \'octokit\' initialization to a separate file [src/octokit.ts], [src/index.ts]
⁕ Added an OpenAI API for completions [packages/utils/apis/openai.ts]
⁕ Lowered numeric tolerance for test files
\'\'\'

Most commits will have less comments than this examples list, 
The last comment does not include the file nomes, 
because there were more than two relevant files in the hypothetical commit.
Do not include parts of the example in your summary.
It is given only as an example of appropriate comments.
In your summary, don't include \'\'\' which is given at the start and end of the example.
Always start all summary points with a \'⁕\'.

Always ignore the changes in the lock files like package-lock.json or yarn.lock or pnpm-lock.yaml or bun.lockb, etc.
Do not include those changes in your summary.
If there are no changes in the diff except the changes in the lock files, then, just say the name of the lock file and tell that it was updated or changed or deleted. No more summary in that. Don't mention its added or changed or updated or deleted contents. 

Do not use \`(backquote) in your summary. Instead, use \'(single quote).

If there are many changes in a single file, do not include all changes. Instead, highlight few main changes.

Total summary points should not exceed 10.
Each summary point should be short and precise.

Please summarize the following diff file: \n\n${diff}`;

	const result = await commitSummaryModel.generateContent(commitSummaryPrompt);

	return result.response.text();
}

export async function summarizeCode(doc: Document) {
	try {
		const code = doc.pageContent.slice(0, 10000);
		const commitSummaryPrompt = [
			`You are an intelligent senior software engineer who specializes in onboarding junior software engineers onto projects.`,
			`You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file.
      Here is the code:
      ---
      ${code}
      ---
  
      Give a summary of the code above in no more than 100 words.
      `
		];

		const response = await codeSummaryModel.generateContent(
			commitSummaryPrompt
		);

		return response.response.text();
	} catch (error) {
		console.error(error);
		return "";
	}
}

export async function generateAiTextToVectorEmbedding(summary: string) {
	const vecterEmbeddingGenAI = new GoogleGenerativeAI(
		process.env.GEMINI_API_KEY_3!
	);
	const model = vecterEmbeddingGenAI.getGenerativeModel({
		model: "text-embedding-004"
	});
	const result = await model.embedContent(summary);
	const embedding = result.embedding;
	return embedding.values;
}
