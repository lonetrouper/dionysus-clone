import React from "react";
import { Button } from "~/components/ui/button";
import useProject from "~/hooks/use-project";
import { api } from "~/trpc/react";

const ArchiveButton = () => {
  const archiveProject = api.project.archiveProject.useMutation();
  const { projectId } = useProject();
  return (
    <Button
      onClick={() => {
        const confirm = window.confirm(
          "Are you sure you want to archive this project?",
        );
        if (confirm) archiveProject.mutate({ projectId });
      }}
    >
      Archive
    </Button>
  );
};

export default ArchiveButton;
