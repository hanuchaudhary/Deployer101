import { HTTP_BACKEND_URL } from "@/config";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useEffect, useState } from "react";

export const useDomain = () => {
  const { getToken } = useAuth();
  const [domainResponse, setDomainResponse] = useState<string>("");
  const [error, setError] = useState<string>(""); // Added error statepr
  const [domain, setDomain] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchDomain = async () => {
    setLoading(true);
    if (!domain) return;
    const token = await getToken();
    try {
      const response = await axios.post(
        `${HTTP_BACKEND_URL}/api/v1/project/domain`,
        {
          domain,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.data;
      setDomainResponse(data.message);
      setError(data.error)
    } catch (error) {
      console.error("Error fetching domain:", error);
      setError("Error fetching domain");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (domain) {
        fetchDomain();
      }
    }, 300); // 300ms debounce delay

    return () => {
      clearTimeout(handler); // Clear timeout on domain change
    };
  }, [domain]);

  return {
    domainResponse,
    loading,
    domain,
    error,
    setDomain,
  };
};
