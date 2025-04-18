"use client";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import useProject from "~/hooks/use-project";
import CommitLog from "./commit-log";
import LangchainPractice from "./langchain-practice";
import Chatbot from "./chatbot";
import AskQuestionCard from "./ask-question-card";
import MeetingCard from "./meeting-card";
import ArchiveButton from "./archive-button";
import InviteButon from "./invite-button";
import TeamMembers from "./team-members";

const Dashboard = () => {
  const { project } = useProject();
  if (project === undefined) return null;
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-y-4">
        <div className="w-fit rounded-md bg-primary px-4 py-3">
          <div className="flex items-center">
            <Github className="size-5 text-white" />
            <p className="text-sm font-medium text-white">
              This project is linked to{" "}
              <Link
                href={project.githubUrl}
                className="inline-flex items-center text-white/80 hover:underline"
              >
                {project.githubUrl}
                <ExternalLink className="ml-1 size-4" />
              </Link>
            </p>
          </div>
        </div>
        <div className="h-4"></div>
        <div className="flex items-center gap-4">
          <TeamMembers />
          <InviteButon />
          <ArchiveButton />
        </div>
      </div>
      <div className="mt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          <AskQuestionCard />
          <MeetingCard />
        </div>
      </div>
      <div className="mt-8"></div>
      <CommitLog />
      {/* <Chatbot /> */}
    </div>
  );
};

export default Dashboard;
