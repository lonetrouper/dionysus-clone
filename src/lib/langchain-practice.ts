import { ChatVertexAI } from "@langchain/google-vertexai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

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
  console.log("langchain test response", response)
};


