"use client";
import useProject from "~/hooks/use-project";
import { pollCommits } from "~/lib/github";

const Dashboard = () => {
  const { project } = useProject();
  if (project === undefined) return null;
  // const polledCommits = pollCommits(project?.githubUrl);
  return <div>page</div>;
};

export default Dashboard;
