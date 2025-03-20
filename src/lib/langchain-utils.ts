import { ChatVertexAI, VertexAIEmbeddings } from "@langchain/google-vertexai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  PromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { PrismaVectorStore } from "@langchain/community/vectorstores/prisma";
import { Prisma, SourceCodeEmbeddings } from "@prisma/client";
import { db } from "~/server/db";
import { createStreamableValue } from "ai/rsc";
import { StringOutputParser } from "@langchain/core/output_parsers";

const model = new ChatVertexAI({
  model: "gemini-1.5-flash",
  temperature: 0,
  streaming: true,
});

const embeddingModel = new VertexAIEmbeddings({
  model: "text-embedding-004",
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

export const langchainPractice = async () => {
  const messages = [
    new SystemMessage("Translate the following from English into Italian"),
    new HumanMessage("langchain tracing test"),
  ];

  const response = await model.invoke(messages);
  console.log("langchain test response", response);
};

export const getCodeSummary = async (fileName: string, code: string) => {
  // const code = doc.pageContent.slice(0, 10000);
  const codeSummaryPromptTemplate =
    PromptTemplate.fromTemplate(`You are an intelligent senior software engineer who specializes in onboarding junior software engineers onto projects.
        You are onboarding a junior software engineer who is new to the project and you are trying to explain the purpose of {fileName} file.
        Here is the source code of the file: 
        --- 
        {code}
        ---
        Please give a summary of no more than 100 words of the code above`);
  const codeSummaryMessage = await codeSummaryPromptTemplate.invoke({
    fileName,
    // fileName: doc.metadata.source,
    code,
  });
  const response = await model.invoke(codeSummaryMessage);
  return response.content.toString();
};

export const addSourceCodeEmbeddings = async (
  sourceCode: SourceCodeEmbeddings,
) => {
  await vectorStore.addModels([sourceCode]);
};

export const askQuestion = async (question: string, projectId: string) => {
  const result = await vectorStore.similaritySearch(question, 5, {
    projectId: { equals: projectId },
  });

  const filesReferenced = result.map((doc) => {
    const sourceCodeEmbedding = {
      id: doc.id,
      fileName: doc.metadata.fileName,
      sourceCode: doc.metadata.sourceCode,
      summary: doc.metadata.summary,
      projectId: projectId,
    } as SourceCodeEmbeddings;
    return sourceCodeEmbedding;
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

  const chain = promptTemplate.pipe(model).pipe(new StringOutputParser());

  const stream = await chain.stream({
    context: context,
    question: question,
  });

  return {
    stream,
    filesReferenced: filesReferenced,
  };
};
