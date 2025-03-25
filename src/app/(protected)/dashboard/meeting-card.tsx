import { Presentation, Upload } from "lucide-react";
import React from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { useDropzone } from "react-dropzone";
import useProject from "~/hooks/use-project";
import { useRouter } from "next/navigation";
import { uploadFile } from "~/lib/firebase";

const MeetingCard = () => {
  const [isUploading, setIsUploading] = React.useState(false);
  const { project } = useProject();
  const [progress, setProgress] = React.useState(0);
  const router = useRouter();

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a"],
    },
    multiple: false,
    maxSize: 50_000_000,
    onDrop: async (acceptedFiles) => {
      if (!project) {
        return;
      }
      setIsUploading(true);
      const file = acceptedFiles[0];
      if (!file) {
        return;
      }
      const downloadUrl = (await uploadFile(file as File, setProgress) as string)
    },
  });

  return (
    <Card className="col-span-2 flex flex-col items-center justify-center p-10">
      <Presentation className="h-10 w-10 animate-bounce" />
      <h3 className="mt-2 text-sm font-semibold text-gray-900">
        Create a new meeting
      </h3>
      <p className="mt-1 text-center text-sm font-semibold text-gray-500">
        Analyse your meeting with ByteBlaze
        <br />
        Powered by AI.
      </p>
      <div className="mt-6">
        <Button disabled={isUploading}>
          <Upload className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          Upload Meeting
          <input className="hidden" />
        </Button>
      </div>
    </Card>
  );
};

export default MeetingCard;
