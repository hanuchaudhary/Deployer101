export async function getUserRepos(username: string) {
  const response = await fetch(
    `https://api.github.com/users/${username}/repos`
  );
  if (response.status === 200) {
    const repos = await response.json();
    return repos;
  } else {
    return null;
  }
}
