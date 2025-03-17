import { ChatVertexAI } from "@langchain/google-vertexai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import { Document } from "@langchain/core/documents";

const model = new ChatVertexAI({
  model: "gemini-1.5-flash",
  temperature: 0,
});

export const langchainPractice = async () => {
  const messages = [
    new SystemMessage("Translate the following from English into Italian"),
    new HumanMessage("langchain tracing test"),
  ];

  const response = await model.invoke(messages);
  console.log("langchain test response", response);
};

export const getCodeSummary = async (doc: Document) => {
  const code = doc.pageContent.slice(0, 10000);
  const codeSummaryPromptTemplate =
    PromptTemplate.fromTemplate(`You are an intelligent senior software engineer who specializes in onboarding junior software engineers onto projects.
        You are onboarding a junior software engineer who is new to the project and you are trying to explain the purpose of {fileName} file.
        Here is the source code of the file: 
        --- 
        {code}
        ---
        Please give a summary of no more than 100 words of the code above`);
  const codeSummaryMessage = await codeSummaryPromptTemplate.invoke({
    fileName: doc.metadata.source,
    code,
  });
  const response = await model.invoke(codeSummaryMessage);
  return response.content;
};
