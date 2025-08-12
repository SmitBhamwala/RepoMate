import { Document } from "@langchain/core/documents";
import { Octokit } from "octokit";
import path from "path";
import { db } from "./db";
import { generateAiTextToVectorEmbedding, summarizeCode } from "./gemini";

export async function getFileCount(
  octokit: Octokit,
  owner: string,
  repo: string,
  branch: string = "main"
) {
  // Get branch reference (commit SHA)
  const { data: refData } = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`
  });

  const commitSha = refData.object.sha;

  // Get full tree recursively
  const { data: treeData } = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: commitSha,
    recursive: "true"
  });

  // Count only files (blobs)
  return treeData.tree.filter((item) => item.type === "blob").length;
}

export async function checkCredits(gitHubURL: string, gitHubToken?: string) {
  const octokit = new Octokit({
    auth: gitHubToken || process.env.GITHUB_TOKEN
  });

  const [owner, repo] = gitHubURL.split("/").slice(-2);

  if (!owner || !repo) {
    return 0;
  }
  const fileCount = await getFileCount(octokit, owner, repo, "main");

  const { data } = await octokit.rest.rateLimit.get();

  console.log("Core API Limit:", data.rate.limit);
  console.log("Core API Remaining:", data.rate.remaining);
  console.log("Resets At:", new Date(data.rate.reset * 1000).toLocaleString());

  return fileCount;
}

export async function loadGitHubRepo(
  githubUrl: string,
  gitHubToken?: string,
  branch: string = "main"
) {
  const octokit = new Octokit({
    auth: gitHubToken || process.env.GITHUB_TOKEN
  });

  const [owner, repo] = githubUrl.split("/").slice(-2);

  // Step 1: Get branch commit SHA
  const { data: refData } = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`
  });
  const commitSha = refData.object.sha;

  // Step 2: Get full repo tree
  const { data: treeData } = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: commitSha,
    recursive: "true"
  });

  // Step 3: Filter out ignored files
  const ignoredPatterns = [
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "bun.lockb",
    "*.lock",
    "node_modules",
    "dist",
    "build",
    "coverage",
    "vendor",
    "tmp",
    "temp",
    "logs",
    "README.md"
  ];

  const files = treeData.tree.filter((item) => {
    if (item.type !== "blob") return false; // only files
    if (!item.path) return false; // skip if path is undefined

    // Check if the file is an image or other ignored file types
    const ignoredExtensions = [
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".svg",
      ".webp",
      ".bmp",
      ".ico",
      ".tiff",
      ".avif",
      ".heic",
      ".heif",
      ".pdf",
      ".doc",
      ".docx",
      ".txt",
      ".md",
      ".csv",
      ".xls",
      ".xlsx",
      ".ppt",
      ".pptx",
      ".json"
    ];
    const fileExtension = path.extname(item.path).toLowerCase();
    if (ignoredExtensions.includes(fileExtension)) {
      return false;
    }

    // Then check other ignored patterns
    return !ignoredPatterns.some((pattern) => {
      const regex = new RegExp(
        "^" + pattern.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$"
      );
      return regex.test(path.basename(item.path!));
    });
  });

  // Step 4: Fetch file contents in parallel
  const docs: Document[] = await Promise.all(
    files.map(async (file) => {
      const { data: fileData } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: file.path!
      });

      if ("content" in fileData) {
        const content = Buffer.from(fileData.content, "base64").toString(
          "utf-8"
        );
        return new Document({
          pageContent: content,
          metadata: { source: file.path! }
        });
      }
      return null;
    })
  ).then((res) =>
    res.filter((doc): doc is Document<{ source: string }> => doc !== null)
  );

  console.log(`Loaded ${docs.length} files from ${githubUrl}`);
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
