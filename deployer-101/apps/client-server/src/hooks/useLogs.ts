import { HTTP_BACKEND_URL } from "@/config";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useState } from "react";

type LogEventType = {
    event_id: string;
    deployment_id: string;
    log: string;
    timestamp: string; // or `Date` if you parse it
  };

export const useLogs = (deploymentId: string) => {
  const [logs, setLogs] = useState<LogEventType[]>([]);
  const { getToken } = useAuth();
  const fetchLogs = async () => {
    const token = await getToken();
    try {
      const response = await axios.get(
        `${HTTP_BACKEND_URL}/api/v1/project/logs/${deploymentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;
      setLogs(data);
    } catch (error) {
      console.log(error);
    }
  };

  return { fetchLogs, logs };
};
