"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { RepoType } from "@/hooks/useGithubRepos";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { generateRandomSubdomain } from "@/lib/generateRandomSlug";
import { HTTP_BACKEND_URL } from "@/config";
import { useDomain } from "@/hooks/useDomain";

export function CreateProjectDialog({ repository }: { repository: RepoType }) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    domainResponse,
    loading: domainLoading,
    setDomain,
    error,
    domain,
  } = useDomain();

  useEffect(() => {
    setDomain(generateRandomSubdomain());
  }, []);

  const { getToken } = useAuth();
  const router = useRouter();

  const handleCreateProject = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const response = await axios.post(
        `${HTTP_BACKEND_URL}/api/v1/project`,
        {
          githubRepoUrl: repository.githubRepoUrl,
          subDomain: domain,
          projectName: repository.name,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Project created successfully!");
      console.log("Project created:", response.data);
      router.push(`/deploy/${response.data.id}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.error || "Error creating project!");
      } else {
        toast.error("Error creating project!");
        console.error("Error creating project:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button>Import</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configure Project</DialogTitle>
          <DialogDescription>
            Set up the domain for your new project from {repository.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <Label htmlFor="project-name" className="text-sm font-medium">
              Project Name
            </Label>
            <Input
              id="project-name"
              value={repository.name}
              disabled
              className="mt-1.5"
            />
          </div>
          <div className="flex items-start space-x-3 space-y-0">
            <div className="grid gap-1.5 w-full">
              <Label htmlFor="subdomain" className="font-medium">
                Generate subdomain
              </Label>
              <div className="flex">
                <Input
                  value={domain}
                  onChange={(e) => setDomain(e.target.value.trim())}
                  placeholder={repository.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, "-")}
                  className="rounded-r-none"
                  disabled={isLoading || !domain}
                />
                <div className="flex items-center justify-center px-3 border border-l-0 rounded-r-md bg-muted text-muted-foreground">
                  .deployer101
                </div>
              </div>
              <div>
                {domainLoading ? (
                  <span className="text-sm text-muted-foreground">
                    Searching if domain is available...
                  </span>
                ) : error ? (
                  <span className="text-sm text-red-500">{error}</span>
                ) : domainResponse ? (
                  <span className="text-sm text-green-500">
                    {domainResponse}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            type="submit"
            onClick={handleCreateProject}
            disabled={isLoading || domainLoading || !!error}
          >
            {isLoading ? "Creating..." : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
