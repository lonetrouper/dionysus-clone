import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const pdfLoader = async () => {
  const loader = new PDFLoader(
    "/home/pratushbose/Documents/personal_projects/dionysus-practice/src/lib/pdfs/datasheet_hsp-io-4ge2s-cpd-pdf-1730617629-11.pdf",
  );

  const docs = await loader.load();
  if (docs[0] && docs[0].pageContent) {
    // console.log(docs[0].metadata)
    console.log(docs[0].pageContent);
  } else {
    console.log("Document content is undefined");
  }
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const allSplits = await textSplitter.splitDocuments(docs);

  allSplits.length;
};
