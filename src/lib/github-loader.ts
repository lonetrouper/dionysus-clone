import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { PrismaVectorStore } from "@langchain/community/vectorstores/prisma";
import { getCodeSummary } from "./langchain-utils";
import { Prisma, SourceCodeEmbeddings } from "@prisma/client";
import { db } from "~/server/db";
import { VertexAIEmbeddings } from "@langchain/google-vertexai";

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

const processDocument = async () => {
  const embeddingModel = new VertexAIEmbeddings({
    model: "text-embedding-004",
  });
  const vectorStore =
    PrismaVectorStore.withModel<SourceCodeEmbeddings>(db).create(embeddingModel, {
        prisma: Prisma,
        tableName: "SourceCodeEmbeddings",
        vectorColumnName: "summaryEmbeddings",
        columns: {
            id: PrismaVectorStore.IdColumn,
            summary: PrismaVectorStore.ContentColumn,
        }

    });
};

export const indexGithubRepo = async (
  githubUrl: string,
  githubToken?: string,
) => {
  const allDocuments = await githubLoader(githubUrl, githubToken);
  const allSummaries = await Promise.all(
    allDocuments.map((doc) => getCodeSummary(doc)),
  );
};
