import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { addSourceCodeEmbeddings, getCodeSummary } from "./langchain-utils";
import { db } from "~/server/db";
import { Document } from "@langchain/core/documents";
import { Octokit } from "octokit";

const getFileCount = async (
  path: string,
  octokit: Octokit,
  githubOwner: string,
  githubRepo: string,
  acc: number = 0,
) => {
  const { data } = await octokit.rest.repos.getContent({
    owner: githubOwner,
    repo: githubRepo,
    path,
  });

  if (!Array.isArray(data) && data.type === "file") {
    return acc + 1;
  }

  if (Array.isArray(data)) {
    let fileCount = 0;
    const directories: string[] = [];

    for (const item of data) {
      if (item.type === "file") {
        fileCount++;
      } else if (item.type === "dir") {
        directories.push(item.path);
      }
    }

    if (directories.length > 0) {
      const directoryCounts = await Promise.all(
        directories.map((dirPath) =>
          getFileCount(dirPath, octokit, githubOwner, githubRepo, 0),
        ),
      );
      fileCount += directoryCounts.reduce((acc, dirCount) => acc + dirCount, 0);
    }

    return fileCount; // Add this return statement
  }

  return acc; // Default return
};
export const checkCredits = async (githubUrl: string, githubToken?: string) => {
  const octokit = new Octokit({ auth: githubToken });
  const githubOwner = githubUrl.split("/")[3];
  const githubRepo = githubUrl.split("/")[4];
  if (!githubOwner || !githubRepo) {
    return 0;
  }
  const fileCount = await getFileCount("", octokit, githubOwner, githubRepo, 0);
  return fileCount;
};

const githubLoader = async (githubUrl: string, githubToken?: string) => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || "",
    branch: "main",
    ignoreFiles: [
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "bun.lockb",
    ],
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5,
  });
  const documents = await loader.load();
  return documents;
};

const processDocument = async (document: Document, projectId: string) => {
  const codeSummary = await getCodeSummary(
    document.metadata.source,
    document.pageContent,
  );
  const sourceCodeEmbeddings = await db.sourceCodeEmbeddings.create({
    data: {
      fileName: document.metadata.source,
      sourceCode: document.pageContent,
      summary: codeSummary,
      projectId: projectId,
    },
  });
  await addSourceCodeEmbeddings(sourceCodeEmbeddings);
};

export const indexGithubRepo = async (
  projectId: string,
  githubUrl: string,
  githubToken?: string,
) => {
  const allDocuments = await githubLoader(githubUrl, githubToken);
  await Promise.all(allDocuments.map((doc) => processDocument(doc, projectId)));
};
