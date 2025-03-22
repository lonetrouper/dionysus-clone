import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { lucario } from "react-syntax-highlighter/dist/esm/styles/prism";
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
      {/* <Tabs>
        <div className="overflow-scroll rounded-md bg-gray-200 p-1">
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
        {fileReferences.map((file) => (
          <TabsContent key={file.fileName}></TabsContent>
        ))}
      </Tabs> */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList>
          {fileReferences.map((file) => (
            <TabsTrigger
              key={file.fileName}
              value={file.fileName}
              className={cn("transition-colors", {
                "bg-black text-primary-foreground": tab === file.fileName,
                "bg-background hover:bg-muted": tab !== file.fileName,
              })}
            >
              {file.fileName}
            </TabsTrigger>
          ))}
        </TabsList>
        {fileReferences.map((file) => (
          <TabsContent key={file.fileName} value={file.fileName}>
            <div className="max-h-96 overflow-auto">
              <SyntaxHighlighter language="typescript" style={lucario}>
                {file.sourceCode}
              </SyntaxHighlighter>
            </div>
            {/* <pre className="max-h-96 overflow-auto">
              {file.sourceCode}
            </pre> */}
          </TabsContent>
        ))}
        <TabsList></TabsList>
      </Tabs>
    </div>
  );
};

export default CodeReferences;
