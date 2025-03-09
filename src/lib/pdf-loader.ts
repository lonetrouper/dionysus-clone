import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ChatVertexAI, VertexAIEmbeddings } from "@langchain/google-vertexai";
import {
  DistanceStrategy,
  PGVectorStore,
} from "@langchain/community/vectorstores/pgvector";
import { Client, PoolConfig } from "pg";
import { pull } from "langchain/hub";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export const pdfLoader = async () => {
  const loader = new PDFLoader(
    "/home/pratushbose/Documents/personal_projects/dionysus-practice/src/lib/pdfs/datasheet_hsp-io-4ge2s-cpd-pdf-1730617629-11.pdf",
  );

  const docs = await loader.load();
  if (docs[0] && docs[0].pageContent) {
    // console.log(docs[0].metadata)
    // console.log(docs[0].pageContent);
  } else {
    console.log("Document content is undefined");
  }
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const allSplits = await textSplitter.splitDocuments(docs);

  const embeddingModel = new VertexAIEmbeddings({
    model: "text-embedding-004",
  });

  const embeddings = await Promise.all(
    allSplits.map((split) => {
      return embeddingModel.embedQuery(split.pageContent);
    }),
  );

  embeddings.forEach((embedding) => {
  });

  // const connectionString = process.env.DATABASE_URL;
  // const pgClient = new Client({connectionString})
  // await pgClient.connect()

  const config = {
    postgresConnectionOptions: {
      type: "postgres",
      host: process.env.PG_HOST,
      port: 5432,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: "postgres",
    } as PoolConfig,
    tableName: "testlangchainjs",
    columns: {
      idColumnName: "id",
      vectorColumnName: "vector",
      contentColumnName: "content",
      metadataColumnName: "metadata",
    },
    // supported distance strategies: cosine (default), innerProduct, or euclidean
    distanceStrategy: "cosine" as DistanceStrategy,
  };

  const vectorStore = await PGVectorStore.initialize(embeddingModel, config);
  await vectorStore.addDocuments(allSplits);

  const llm = new ChatVertexAI({
    model: "gemini-1.5-flash",
    temperature: 0,
  });

  // const promptTemplate = await pull<ChatPromptTemplate>("rlm/rag-prompt");

  const question = "Which product supports DHCP";

  // const retrievedDocuments = await vectorStore.similaritySearch(question);
  // const docContent = retrievedDocuments
  //   .map((doc) => doc.pageContent)
  //   .join("\n");
  // const messages = await promptTemplate.invoke({
  //   question: question,
  //   context: docContent,
  // });
  // const answer = await llm.invoke(messages);
  // console.log("RAG answer", answer);

  // Testing the classifier

  const queryMessages = await classifierPromptTemplate(question);
  const answer = await llm.invoke(queryMessages);
  console.log(answer);
};

// Create a prompt template that instructs the LLM on classification
const classifierPromptTemplate = async (query: string) => {
  const promptTemplate = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are a product specification assistant. Analyze the following query and determine if it asks for aggregated data (spanning multiple products) or specific data about a single product. Return only one label: 'aggregated' or 'product-specific'.",
    ],
    ["user", "Query: {query}\n\nClassification:"],
  ]);
  return await promptTemplate.invoke({ query });
};
