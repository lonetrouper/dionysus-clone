import { Octokit } from "octokit";
import axios from "axios";
import { getCommitSummary } from "./generative-ai";
import { retry } from "./utils";
import { db } from "~/server/db";
import { Commit } from "@prisma/client";

const octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN });

type Response = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

export const pollCommits = async (projectId: string) => {
  const projectInDb = await getProjectFromDb(projectId);
  if (projectInDb === null) {
    throw new Error("Project not found");
  }
  const topTenCommits = await latestCommits(projectInDb.githubUrl);
  const commitsInDb = await getCommitsForProjectInDb(projectId);
  const unprocessedCommits: Response[] = await unProcessedCommits(
    commitsInDb,
    topTenCommits,
  );

  const summaryResponse = await Promise.allSettled(
    unprocessedCommits.map((commit) => {
      return summariseCommit(projectInDb.githubUrl, commit.commitHash);
    }),
  );

  const summaries = summaryResponse.map((response) => {
    console.log("response", response);
    if (response.status === "fulfilled") {
      return response.value as string;
    }
    return "";
  });
  const commits = await db.commit.createMany({
    data: summaries.map((summary, index) => {
      console.log(`processing commit ${index}`);
      return {
        projectId,
        commitHash: unprocessedCommits[index]!.commitHash,
        commitMessage: unprocessedCommits[index]!.commitMessage,
        commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
        commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
        commitDate: unprocessedCommits[index]!.commitDate,
        summary,
      };
    }),
  });
  return commits;
};

const summariseCommit = async (githubUrl: string, commitHash: string) => {
  const contents = await getCommitContents(githubUrl, commitHash);
  return await retry(() => getCommitSummary(contents), {
    maxAttempts: 5,
    initialDelay: 60000,
    maxDelay: 70000,
    backoffFactor: 3,
  });
};

const unProcessedCommits = async (
  a: Commit[],
  b: Response[],
): Promise<Response[]> => {
  return b.filter(
    (commit) => !a.some((c) => c.commitHash === commit.commitHash),
  );
};

const getProjectFromDb = async (projectId: string) => {
  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
  });
  return project;
};

const latestCommits = async (githubUrl: string): Promise<Response[]> => {
  const commitsInGithub: Response[] = await getCommitsFromGithub(githubUrl);
  const sortedCommits = sortCommitsByTimestamp(commitsInGithub);
  return sortedCommits.slice(0, 10);
};

const getCommitsFromGithub = async (githubUrl: string): Promise<Response[]> => {
  const [owner, repo] = githubUrl.split("/").slice(-2);
  if (!owner || !repo) {
    throw new Error("Invalid GitHub URL");
  }
  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });

  const responses = data.map((commit: any) => ({
    commitHash: commit.sha as string,
    commitMessage: commit.commit.message,
    commitAuthorName: commit.commit?.author?.name ?? "",
    commitAuthorAvatar: commit.author?.avatar_url ?? "",
    commitDate: commit.commit?.author?.date ?? "",
  }));
  return responses;
};

const sortCommitsByTimestamp = (commits: Response[]): Response[] => {
  return commits.sort(
    (a: Response, b: Response) =>
      new Date(b.commitDate).getTime() - new Date(a.commitDate).getTime(),
  );
};

const getCommitsForProjectInDb = async (
  projectId: string,
): Promise<Commit[]> => {
  const commits = await db.commit.findMany({
    where: {
      projectId,
    },
  });
  return commits;
};

const getCommitContents = async (
  githubUrl: string,
  commitHash: string,
): Promise<string> => {
  const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
    headers: {
      Accept: "application/vnd.github.v3.diff",
    },
  });
  return data;
};
