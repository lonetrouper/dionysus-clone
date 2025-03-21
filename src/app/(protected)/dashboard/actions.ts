"use server";
import { askQuestion } from "~/lib/langchain-utils";

export const askQuestionServerComponent = async (
  question: string,
  projectId: string,
) => {
  return await askQuestion(question, projectId);
};
