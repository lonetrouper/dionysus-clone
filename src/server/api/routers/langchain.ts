import { langchainPractice } from "~/lib/langchain-practice";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const langchainRouter = createTRPCRouter({
    getLangchainResponse: protectedProcedure.query(async({ctx}) => {
        langchainPractice();
    })
})