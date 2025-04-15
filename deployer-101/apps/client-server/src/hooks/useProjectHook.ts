import { useEffect, useState } from "react";
import { ProjectType } from "@repo/common/types";
import { HTTP_BACKEND_URL } from "@/config";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";

export const useProjectHook = () => {
  const { getToken } = useAuth();

  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await axios.get(`${HTTP_BACKEND_URL}/api/v1/project`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;
      if (Array.isArray(data)) {
        setProjects(data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return { projects, loading, fetchProjects };
};

export const useSingleProjectHook = (projectId: string) => {
  const { getToken } = useAuth();

  const [project, setProject] = useState<ProjectType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await axios.get(
        `${HTTP_BACKEND_URL}/api/v1/project/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;
      if (data) {
        setProject(data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching project:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  return { project, loading, fetchProject };
}
