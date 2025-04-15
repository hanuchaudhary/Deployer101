import axios from "axios";
import { useEffect, useState } from "react";

export const useGithubRepos = () => {
  const [repos, setRepos] = useState<RepoType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(10);

  useEffect(() => {
    setLoading(true);
    const fetchRepos = async () => {
      try {
        const response = await axios.post("/api/github", {
          limit: limit,
        });
        const repos = await response.data;
        setRepos(repos);
      } catch (error) {
        console.error("There was an error fetching the data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, []);

  return { repos, loading, setLimit };
};

export interface RepoType {
  name: string;
  url: string;
  githubRepoUrl: string;
  description: string;
  avatar: string;
  isPrivate: boolean;
  defaultBranch: string;
  updatedAt: string;
}