"use client";
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";

const Chatbot = () => {
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<any>("");

  const getAnswerMutation = api.langchain.getAnswerFromLLM.useMutation({
    onSuccess: (data) => {
      setAnswer(data);
      console.log("LLM answer:", data);
    },
  });
  const { data: products } = api.langchain.getAllProducts.useQuery();

  if (!products) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log("submitting");
    e.preventDefault();
    getAnswerMutation.mutate({
      productName: selectedProduct,
      question: question,
    });
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Select onValueChange={setSelectedProduct} value={selectedProduct}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a product" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Select Product</SelectLabel>
              {products.map((product: string) => (
                <SelectItem key={product} value={product}>
                  {product}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="h-4"></div>
        <Textarea
          placeholder="Type your message here."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <div className="h-4"></div>
        <Button type="submit" disabled={getAnswerMutation.isPending}>
          {getAnswerMutation.isPending ? "Loading..." : "Ask question"}
        </Button>
        <div className="h-4"></div>
      </form>
      <pre>
        {getAnswerMutation.isPending
          ? "Generating answer..."
          : answer || "LLM Answer will appear here"}
      </pre>
    </div>
  );
};
export default Chatbot;
