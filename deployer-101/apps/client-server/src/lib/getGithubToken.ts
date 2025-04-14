import { auth, clerkClient } from "@clerk/nextjs/server";

export async function getGitHubToken() {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  // Fetch the user's data
  const user = await (await clerkClient()).users.getUser(userId);
  const githubAccount = user.externalAccounts.find(
    (account) => account.provider === "oauth_github"
  );

  if (!githubAccount) {
    throw new Error("GitHub account not connected.");
  }

  // Fetch the OAuth token using Clerk's API
  const tokenResponse = await (await clerkClient()).users.getUserOauthAccessToken(userId,"oauth_github")
  const token = tokenResponse.data[0]?.token as string;
  const githubToken = token;
  if (!githubToken) {
    throw new Error("GitHub token not found for this user.");
  }

  return githubToken;
}