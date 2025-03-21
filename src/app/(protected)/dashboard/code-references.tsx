import React from "react";
import { Tabs } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";

type Props = {
  fileReferences: {
    fileName: string;
    sourceCode: string;
    summary: string;
  }[];
};

const CodeReferences = ({ fileReferences }: Props) => {
  if (fileReferences.length === 0) {
    return null;
  }
  const [tab, setTab] = React.useState(fileReferences[0]?.fileName);
  return (
    <div>
      <Tabs>
        <div className="flex gap-2 overflow-auto rounded-md bg-gray-200 p-1">
          {fileReferences.map((file) => (
            <button onClick={() => setTab(file.fileName)} key={file.fileName}
            className={cn("whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted",
                {
                    "bg-primary text-primary-foreground hover:bg-primary": tab === file.fileName
                }
            )}>
              {file.fileName}
            </button>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

export default CodeReferences;
