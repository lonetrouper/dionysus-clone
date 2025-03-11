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
import { webLoaderSample } from "./web-loader";
import { Document } from "@langchain/core/documents";
import { doc } from "prettier";
import { get } from "http";

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

const embeddingModel = new VertexAIEmbeddings({
  model: "text-embedding-004",
});

const vectorStore = await PGVectorStore.initialize(embeddingModel, config);

const llm = new ChatVertexAI({
  model: "gemini-1.5-flash",
  temperature: 0,
});

export const pdfLoader = async () => {
  const documentLocations = [
    "/home/pratushbose/Documents/personal_projects/dionysus-practice/src/lib/pdfs/datasheet_ion4_4_2-pdf-1718603223-11.pdf",
    "/home/pratushbose/Documents/personal_projects/dionysus-practice/src/lib/pdfs/datasheet_ion4e-pdf-1718603155-11.pdf",
    "/home/pratushbose/Documents/personal_projects/dionysus-practice/src/lib/pdfs/datasheet_ion4xe_ion4xe-ext-updated-pdf-1717654776-11.pdf",
    "/home/pratushbose/Documents/personal_projects/dionysus-practice/src/lib/pdfs/datasheet_ion4xi_wp-pdf-1717520737-11.pdf",
    "/home/pratushbose/Documents/personal_projects/dionysus-practice/src/lib/pdfs/datasheet_ion12xi_h_h2-pdf-1717520920-11.pdf",
    "/home/pratushbose/Documents/personal_projects/dionysus-practice/src/lib/pdfs/datasheet-ion12xe_h2-pdf-1737086199-11.pdf",
  ];

  const productNames = [
    "ion4",
    "ion4e",
    "ion4xe",
    "ion4xi",
    "ion12xi",
    "ion12xe",
  ];

  documentLocations.forEach(async (location, index) => {
    const documentsWithMetadata = await getSplitsWithMetadata(
      location,
      productNames[index],
    );
    await addEmbeddingsToVectorStore(
      documentsWithMetadata,
      productNames[index],
    );
  });

  console.log("rag answer",await getRAGAnswer("What is the power consumption?", "ion4xe"));

  // Testing the classifier

  // const queryMessages = await classifierPromptTemplate(question);
  // const answer = await llm.invoke(queryMessages);
  // console.log(answer);
  // webLoaderSample();
};

const getRAGAnswer = async (question: string, productName: string) => {
  const client = new Client(config.postgresConnectionOptions);
  await client.connect();

  // Query the database for documents matching the product name
  const metadataQuery = `
    SELECT id, content, metadata
    FROM ${config.tableName}
    WHERE metadata->>'productName' = $1
  `;
  const res = await client.query(metadataQuery, [productName]);
  const filteredDocs = res.rows.map((row) => ({
    id: row.id,
    pageContent: row.content,
    metadata: row.metadata,
  }));

  await client.end();

  // Perform semantic search on the retrieved documents
  const retrievedDocuments = await vectorStore.similaritySearch(question, 5, {
    filter: { "metadata->>'productName": productName },
  });

  // console.log("retrieved documents", retrievedDocuments);
  const docContent = retrievedDocuments
    .map((doc) => doc.pageContent)
    .join("\n");

  const promptTemplate = await pull<ChatPromptTemplate>("rlm/rag-prompt");

  const messages = await promptTemplate.invoke({
    question: question,
    context: docContent,
  });
  const answer = await llm.invoke(messages);
  return answer;
};

const getSplitsWithMetadata = async (
  pdfLocation: string,
  productName: string | undefined,
) => {
  const loader = new PDFLoader(pdfLocation);
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
  const documentsWithMetadata = allSplits.map((split, index) => ({
    pageContent: split.pageContent,
    metadata: {
      documentId: index,
      productName: productName,
    },
  }));

  return documentsWithMetadata;
};

const addEmbeddingsToVectorStore = async (
  allSplits: Document[],
  productName: string | undefined,
) => {
  const client = new Client(config.postgresConnectionOptions);
  await client.connect();

  // Check if the product name already exists
  const checkProductQuery = `
    SELECT COUNT(*) as count
    FROM ${config.tableName}
    WHERE metadata->>'productName' = $1
  `;
  const checkProductResult = await client.query(checkProductQuery, [
    productName,
  ]);
  const productExists = checkProductResult.rows[0].count > 0;

  if (!productExists) {
    // const vectorStore = await PGVectorStore.initialize(embeddingModel, config);
    await vectorStore.addDocuments(allSplits);

    console.log(
      `Documents for product "${productName}" added to the vector store.`,
    );
  } else {
    console.log(`Product "${productName}" already exists in the database.`);
  }
  await client.end();
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
