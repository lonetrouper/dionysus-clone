// import "cheerio";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { pull } from "langchain/hub";
import { Annotation, StateGraph } from "@langchain/langgraph";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ChatVertexAI, VertexAIEmbeddings } from "@langchain/google-vertexai";
import {
  DistanceStrategy,
  PGVectorStore,
} from "@langchain/community/vectorstores/pgvector";
import { Client, PoolConfig } from "pg";

export const webLoaderSample = async () => {
  const pTagSelector = "p";
  const cheerioLoader = new CheerioWebBaseLoader(
    "https://lilianweng.github.io/posts/2023-06-23-agent/",
    {
      selector: pTagSelector,
    },
  );

  const docs = await cheerioLoader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const allSplits = await splitter.splitDocuments(docs);
  const config = {
    postgresConnectionOptions: {
      type: "postgres",
      host: process.env.PG_HOST,
      port: 5432,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: "postgres",
    } as PoolConfig,
    tableName: "webLoaderSample",
    columns: {
      idColumnName: "id",
      vectorColumnName: "vector",
      contentColumnName: "content",
      metadataColumnName: "metadata",
    },
    // supported distance strategies: cosine (default), innerProduct, or euclidean
    distanceStrategy: "cosine" as DistanceStrategy,
  };

  const llm = new ChatVertexAI({
    model: "gemini-1.5-flash",
    temperature: 0,
  });

  const embeddingModel = new VertexAIEmbeddings({
    model: "text-embedding-004",
  });
  const vectorStore = await PGVectorStore.initialize(embeddingModel, config);

  vectorStore.addDocuments(allSplits);

  const promptTemplate = await pull<ChatPromptTemplate>("rlm/rag-prompt");

  const InputStateAnnotation = Annotation.Root({
    question: Annotation<string>,
  });

  const StateAnnotation = Annotation.Root({
    question: Annotation<string>,
    context: Annotation<Document[]>,
    answer: Annotation<string>,
  });

  const retrieve = async (state: typeof InputStateAnnotation.State) => {
    const retrievedDocuments = await vectorStore.similaritySearch(
      state.question,
    );
    return { context: retrievedDocuments };
  };

  const generate = async (state: typeof StateAnnotation.State) => {
    const docsContent = state.context.map((doc) => doc.pageContent).join("\n");
    const messages = await promptTemplate.invoke({
      question: state.question,
      context: docsContent,
    });
    const response = await llm.invoke(messages);
    return { answer: response.content };
  };

  const graph = new StateGraph(StateAnnotation)
    .addNode("retrieve", retrieve)
    .addNode("generate", generate)
    .addEdge("__start__", "retrieve")
    .addEdge("retrieve", "generate")
    .addEdge("generate", "__end__")
    .compile();

  let input = { question: "What is task Decomposition?" };
  const result = await graph.invoke(input);
  console.log(result.answer);
};
