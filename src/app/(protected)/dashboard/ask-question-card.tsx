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

const AskQuestionCard = () => {
  const [question, setQuestion] = React.useState<string>("");
  const [open, setOpen] = React.useState<boolean>(true);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

  }
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <div>
              <DialogTitle>
                <Image src="/byteblaze.png" alt="byteblaze" width={40} height={40} />
              </DialogTitle>
              <Button></Button>
            </div>
          </DialogHeader>
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
