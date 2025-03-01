import { Octokit } from "octokit";
import axios from "axios";
import { getCommitSummary } from "./generative-ai";
import { retry } from "./utils";
import { db } from "~/server/db";

const octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN });

type Response = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

export const processCommits = async (githubUrl: string) => {
  const [owner, repo] = githubUrl.split("/").slice(-2);
  if (!owner || !repo) {
    throw new Error("Invalid GitHub URL");
  }
  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });

  const sortedCommits = data.sort(
    (a: any, b: any) =>
      new Date(b.commit.author.date).getTime() -
      new Date(a.commit.author.date).getTime(),
  );
  const topTenLatestCommits = sortedCommits.slice(0, 10).map((commit: any) => ({
    commitHash: commit.sha as string,
    commitMessage: commit.commit.message,
    commitAuthorName: commit.commit?.author?.name ?? "",
    commitAuthorAvatar: commit.author?.avatar_url ?? "",
    commitDate: commit.commit?.author?.date ?? "",
  }));

  topTenLatestCommits.forEach(async (commit) => {
    const { data } = await axios.get(
      `${githubUrl}/commit/${commit.commitHash}.diff`,
      {
        headers: {
          Accept: "application/vnd.github.v3.diff",
        },
      },
    );
    await retry(() => getCommitSummary(data), {
      maxAttempts: 5,
      initialDelay: 60000,
      maxDelay: 70000,
      backoffFactor: 3,
    });
    // await getCommitSummary(data);
  });
};

export const pollCommits = async (projectId: string) => {
  const projectInDb = await getProjectFromDb(projectId);
  if (projectInDb === null) {
    throw new Error("Project not found");
  }
  const topTenCommits = await latestCommits(projectInDb.githubUrl);
  const commitsInDb = await getCommitsForProjectInDb(projectId);

};

const unProcessedCommits = async (a: any[], b: any[]) => {
  return a.filter((commit) => !b.find((c) => c.commitHash === commit.sha));
}

const getProjectFromDb = async (projectId: string) => {
  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
  });
  return project;
};

const latestCommits = async (githubUrl: string) => {
  const commitsInGithub = await getCommitsFromGithub(githubUrl);
  const sortedCommits = sortCommitsByTimestamp(commitsInGithub);
  return sortedCommits.slice(0, 10);
};

const getCommitsFromGithub = async (githubUrl: string) => {
  const [owner, repo] = githubUrl.split("/").slice(-2);
  if (!owner || !repo) {
    throw new Error("Invalid GitHub URL");
  }
  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });
  return data;
};

const sortCommitsByTimestamp = (commits: any[]) => {
  return commits.sort(
    (a: any, b: any) =>
      new Date(b.commit.author.date).getTime() -
      new Date(a.commit.author.date).getTime(),
  );
};

const getCommitsForProjectInDb = async (projectId: string) => {
  const commits = await db.commit.findMany({
    where: {
      projectId,
    },
  });
};
