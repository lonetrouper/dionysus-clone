import MDEditor from "@uiw/react-md-editor";
import Image from "next/image";
import React from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import useProject from "~/hooks/use-project";
import useRefetch from "~/hooks/use-refetch";
import { api } from "~/trpc/react";
import { askQuestionServerComponent } from "./actions";
import { toast } from "sonner";
import CodeReferences from "./code-references";

const AskQuestionCard = () => {
  const [question, setQuestion] = React.useState<string>("");
  const [open, setOpen] = React.useState<boolean>(false);
  const [answer, setAnswer] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [fileReferences, setFileReferences] = React.useState<
    {
      fileName: string;
      sourceCode: string;
      summary: string;
    }[]
  >([]);
  const { projectId } = useProject();

  const saveAnswer = api.project.saveAnswer.useMutation({
    onSuccess: () => {
      toast.success("Answer saved successfully");
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to save answer");
      console.log(error);
    },
  });
  // const getAnswerMutation = api.project.getAnswer.useMutation()

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setAnswer("");
    // setFileReferences([]);
    e.preventDefault();

    setLoading(true);
    const { stream, filesReferenced } = await askQuestionServerComponent(
      question,
      projectId,
    );
    filesReferenced.map((file) => {
      const currentReference = {
        fileName: file.fileName,
        sourceCode: file.sourceCode,
        summary: file.summary,
      };
      setFileReferences((prev) => [...prev, currentReference]);
    });

    setOpen(true);
    const reader = stream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      setAnswer((prev) => prev + value);
    }
    setLoading(false);
  };
  const refetch = useRefetch();
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[80vw]" data-color-mode="light">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>
                <Image
                  src="/byteblaze.png"
                  alt="byteblaze"
                  width={40}
                  height={40}
                />
              </DialogTitle>
              <Button
                variant={"outline"}
                disabled={saveAnswer.isPending}
                onClick={() => {
                  saveAnswer.mutate({
                    projectId,
                    question,
                    answer,
                    fileReferences
                  });
                }}
              >
                Save Answer
              </Button>
            </div>
          </DialogHeader>
          <MDEditor.Markdown source={answer} className="p-2 rounded-md"  />
          <div className="h-4"></div>
          <CodeReferences fileReferences={fileReferences} />
          <Button type="submit" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea
              placeholder="Which file should I edit to change the home page?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="h-4"></div>
            <Button type="submit" disabled={loading}>
              Ask ByteBlaze!
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
