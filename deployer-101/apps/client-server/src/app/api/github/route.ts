import { getGitHubToken } from "@/lib/getGithubToken";
import { graphql } from "@octokit/graphql";
import { NextRequest, NextResponse } from "next/server";

async function initializeGraphQL() {
  const githubToken = await getGitHubToken();
  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${githubToken}`,
    },
  });
  return graphqlWithAuth;
}

const reposQuery = `
  query($first: Int!, $orderBy: RepositoryOrder) {
    viewer {
      repositories(first: $first, orderBy: $orderBy) {
        nodes {
          name
          url
          description
          owner {
            avatarUrl(size: 32)
          }
          isPrivate
          defaultBranchRef {
            name
          }
          updatedAt
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;
async function fetchGitHubRepos(limit: number = 10) {
  const graphqlWithAuth = await initializeGraphQL();

  try {
    const data: any = await graphqlWithAuth(reposQuery, {
      first: limit, // Fetch 10 repos at a time
      orderBy: { field: "UPDATED_AT", direction: "DESC" }, // Sort by last updated, descending
    });

    return data.viewer.repositories.nodes.map((repo: any) => ({
      name: repo.name,
      url: repo.url,
      githubRepoUrl: repo.url,
      description: repo.description || "No description",
      avatar: repo.owner.avatarUrl,
      isPrivate: repo.isPrivate,
      defaultBranch: repo.defaultBranchRef?.name || "main",
      updatedAt: new Date(repo.updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
    }));
  } catch (error: any) {
    console.error("Error fetching GitHub repos:", error.message);
    throw new Error("Failed to fetch repositories");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { limit } = await request.json();

    const repos = await fetchGitHubRepos(limit);
    return NextResponse.json(repos, {
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in GET /api/github:", error.message);
    return NextResponse.json(
      { message: "Failed to fetch repositories", error: error },
      { status: 500 }
    );
  }
}