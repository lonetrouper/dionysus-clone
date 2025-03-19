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
import { askQuestion } from "./actions";
import useProject from "~/hooks/use-project";
import { set } from "date-fns";

const AskQuestionCard = () => {
  const [question, setQuestion] = React.useState<string>("");
  const [open, setOpen] = React.useState<boolean>(false);
  const [answer, setAnswer] = React.useState<string>("");
  const { projectId } = useProject();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setOpen(true);
    e.preventDefault();
    const {stream } = await askQuestion(question, projectId);
    const reader = stream.getReader();
    while(true){
      const { done, value } = await reader.read();
      if(done) break;
      setAnswer(prev => prev + value);
    }

  };
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <div>
              <DialogTitle>
                <Image
                  src="/byteblaze.png"
                  alt="byteblaze"
                  width={40}
                  height={40}
                />
              </DialogTitle>
              <Button></Button>
            </div>
          </DialogHeader>
          <div>{answer}</div>
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
            <Button type="submit">Ask ByteBlaze!</Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
