"use server";

import { PrismaVectorStore } from "@langchain/community/vectorstores/prisma";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { ChatVertexAI, VertexAIEmbeddings } from "@langchain/google-vertexai";
import { Prisma, SourceCodeEmbeddings } from "@prisma/client";
import { db } from "~/server/db";

const embeddingModel = new VertexAIEmbeddings({
  model: "text-embedding-004",
});
// Initialize the LLM with streaming enabled
const llm = new ChatVertexAI({
  model: "gemini-1.5-flash",
  temperature: 0,
  streaming: true,
});

const vectorStore = PrismaVectorStore.withModel<SourceCodeEmbeddings>(
  db,
).create(embeddingModel, {
  prisma: Prisma,
  tableName: "SourceCodeEmbeddings",
  vectorColumnName: "summaryEmbeddings",
  columns: {
    id: PrismaVectorStore.IdColumn,
    summary: PrismaVectorStore.ContentColumn,
    sourceCode: true,
    fileName: true,
    projectId: true,
  },
});
export const askQuestion = async (question: string, projectId: string) => {
  const result = await vectorStore.similaritySearch(question, 5, {
    projectId: { equals: projectId },
  });

  // Build context from retrieved documents
  let context = "";
  for (const doc of result) {
    context += `source: ${doc.metadata.fileName}\ncode content: ${doc.metadata.sourceCode}\n summary of file: ${doc.pageContent}\n\n`;
  }

  // Create prompt template
  const promptTemplate = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(
      `You are a AI code assistant who answers questions about the codebase. Your target audience is a technical intern who is new to the codebase.
      You are a brand new, powerful, human-like artificial intelligence.
      You have expert knowledge and are helpful, clever, and articulate.
      You are well-behaved and well-mannered.
      You are friendly, kind, and inspiring, always eager to provide thoughtful responses.
      
      If the question asks about code or a specific file, provide detailed answers with step-by-step instructions.
      
      START CONTEXT BLOCK
      {context}
      END CONTEXT BLOCK
      
      Take into account the CONTEXT BLOCK provided in the conversation.
      If the context does not provide the answer to a question, say "I'm sorry, I don't have the answer to that question."
      Don't apologize for previous responses, just indicate when new information is gained.
      Don't invent anything not drawn directly from the context.
      Answer in markdown syntax, with code snippets if needed. Be as detailed as possible.`,
    ),
    HumanMessagePromptTemplate.fromTemplate("{question}"),
  ]);

  const chain = promptTemplate.pipe(llm).pipe(new StringOutputParser());

  const stream = await chain.stream({
    context: context,
    question: question,
  });

  return {
    stream,
    // filesReferenced: result,
  };
};
