import { langchainPractice } from "~/lib/langchain-practice";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { pdfLoader } from "~/lib/pdf-loader";

export const langchainRouter = createTRPCRouter({
  getLangchainResponse: protectedProcedure.query(async ({ ctx }) => {
    // langchainPractice();
    pdfLoader();
  }),
});
