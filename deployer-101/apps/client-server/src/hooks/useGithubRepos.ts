import axios from "axios";
import { useEffect, useState } from "react";

export const useGithubRepos = () => {
  const [repos, setRepos] = useState<any[]>([]);
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

export const useGithubSingleRepo = (owner: string, repoName: string) => {
  const [singleRepo, setSingleRepo] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    setLoading(true);
    const fetchRepo = async () => {
      try {
        const response = await axios.get(`/api/github`, {
          params: {
            owner,
            name: repoName,
          },
        });
        const repo = await response.data;
        setSingleRepo(repo);
      } catch (error) {
        console.error("There was an error fetching the data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepo();
  }, []);

  return { singleRepo, loading };
};
