import { langchainPractice } from "~/lib/langchain-practice";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getRAGAnswer, pdfLoader } from "~/lib/pdf-loader";
import { metadata } from "~/app/layout";
import { z } from "zod";

export const langchainRouter = createTRPCRouter({
  getLangchainResponse: protectedProcedure.query(async ({ ctx }) => {
    // langchainPractice();
    pdfLoader();
  }),
  getAllProducts: protectedProcedure.query(async ({ ctx }) => {
    const allMetadata: any[] = await ctx.db
      .$queryRaw`SELECT metadata FROM testlangchainjs`;
    const allProductNames = allMetadata.map(
      (metadata) => metadata.metadata.productName,
    );
    const allUniqueProductNames = Array.from(new Set(allProductNames));
    return allUniqueProductNames as string[];
  }),
  getAnswerFromLLM: protectedProcedure
    .input(
      z.object({
        productName: z.string(),
        question: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await getRAGAnswer(input.productName, input.question);
    }),
});
