import { Octokit } from "octokit";
import axios from "axios";
import { getCommitSummary } from "./generative-ai";

const octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN });

type Response = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

export const pollCommits = async (githubUrl: string) => {
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
    await getCommitSummary(data);
  });
};
