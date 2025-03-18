import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { PrismaVectorStore } from "@langchain/community/vectorstores/prisma";
import { addSourceCodeEmbeddings, getCodeSummary } from "./langchain-utils";
import { Prisma, SourceCodeEmbeddings } from "@prisma/client";
import { db } from "~/server/db";
import { VertexAIEmbeddings } from "@langchain/google-vertexai";
import { Document } from "@langchain/core/documents";

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
