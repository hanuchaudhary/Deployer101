"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Code,
  Globe,
  RefreshCw,
  Server,
  Terminal,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DEPLOYMENT_STATUS } from "@repo/common/types";
import { useSingleProjectHook } from "@/hooks/useProjectHook";
import axios from "axios";
import { HTTP_BACKEND_URL } from "@/config";
import { useAuth } from "@clerk/nextjs";
import { useLogs } from "@/hooks/useLogs";

export default function DeployProject({ projectId }: { projectId: string }) {
  const { loading, project } = useSingleProjectHook(projectId);
  const [generatedDomain, setGeneratedDomain] = useState<string>("");
  const { getToken } = useAuth();

  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] =
    useState<DEPLOYMENT_STATUS>("IDLE");
  const [deploymentId, setDeploymentId] = useState<string>("");
  const { fetchLogs, logs } = useLogs(deploymentId);

  // Ref for logs console to enable auto-scroll
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest log
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop =
        logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Poll for logs and deployment status
  useEffect(() => {
    if (!deploymentId) return;

    const interval = setInterval(async () => {
      // Fetch logs
      await fetchLogs();

      // Fetch deployment status
      try {
        const token = await getToken();
        const response = await axios.get(
          `${HTTP_BACKEND_URL}/api/v1/project/status/${deploymentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const { status } = response.data;
        setDeploymentStatus(status);

        // Stop polling if deployment is complete
        if (status === "SUCCEEDED" || status === "FAILED") {
          setIsDeploying(false);
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Error fetching deployment status:", error);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [deploymentId, fetchLogs, getToken]);

  const handleDeploy = async () => {
    const token = await getToken();
    try {
      setIsDeploying(true);
      setDeploymentStatus("QUEUED");
      const response = await axios.post(
        `${HTTP_BACKEND_URL}/api/v1/project/deploy`,
        { projectId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;
      setDeploymentId(data.deploymentId);
      setGeneratedDomain(data.url);
    } catch (error) {
      console.error("Error triggering deployment:", error);
      setIsDeploying(false);
      setDeploymentStatus("FAILED");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <main className="flex-1 container mx-auto py-6 px-4 md:px-6">
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="mb-4 hover:bg-[#222] text-neutral-400 hover:text-white"
          >
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Import
            </Link>
          </Button>
          {loading ? (
            <>
              <Skeleton className="h-8 w-64 bg-[#222] mb-2" />
              <Skeleton className="h-5 w-96 bg-[#222]" />
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold">Deploy {project?.name}</h1>
              <p className="text-neutral-400 mt-2">
                Configure your deployment settings
              </p>
            </>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-[#111] border-[#333] shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-neutral-400" />
                <CardTitle>Domain Settings</CardTitle>
              </div>
              <CardDescription className="text-neutral-400">
                Choose how you want to access your project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="generated" className="font-medium">
                  Generated Domain
                </Label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center flex-1 bg-[#0A0A0A] border border-[#333] rounded-md overflow-hidden">
                    <Input
                      value={project?.subDomain || ""}
                      readOnly
                      disabled
                      className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <div className="px-3 py-2 bg-[#111] border-l border-[#333] text-neutral-400">
                      .deployer101
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    className="border-[#333] bg-[#111] hover:bg-[#222] text-neutral-400 hover:text-white"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111] border-[#333] shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-neutral-400" />
                <CardTitle>Deployment Settings</CardTitle>
              </div>
              <CardDescription className="text-neutral-400">
                Configure build and environment settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-neutral-300">Framework Preset</Label>
                <div className="flex items-center justify-between p-3 border border-[#333] rounded-md bg-[#0A0A0A]">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-neutral-400" />
                    <span>Next.js</span>
                  </div>
                  <Badge className="bg-[#222] text-neutral-300 hover:bg-[#222]">
                    Detected
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-neutral-300">Root Directory</Label>
                <div className="flex items-center justify-between p-3 border border-[#333] rounded-md bg-[#0A0A0A]">
                  <div className="flex items-center gap-2">
                    <span>./</span>
                  </div>
                  <Badge className="bg-[#222] text-neutral-300 hover:bg-[#222]">
                    Default
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-neutral-300">Node.js Version</Label>
                <div className="flex items-center justify-between p-3 border border-[#333] rounded-md bg-[#0A0A0A]">
                  <div className="flex items-center gap-2">
                    <span>18.x</span>
                  </div>
                  <Badge className="bg-[#222] text-neutral-300 hover:bg-[#222]">
                    Default
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 bg-[#111] border-[#333] shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-neutral-400" />
              <div>
                <CardTitle>Deployment</CardTitle>
                <CardDescription className="text-neutral-400">
                  Deploy your project to production
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {generatedDomain && (
                <Button
                  className="bg-white text-black hover:bg-neutral-200 transition-colors"
                  asChild
                >
                  <a
                    href={generatedDomain}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Site
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
              <Button
                onClick={handleDeploy}
                disabled={isDeploying}
                className={
                  isDeploying
                    ? "bg-neutral-800 text-neutral-400"
                    : "bg-white text-black hover:bg-neutral-200 transition-colors"
                }
              >
                {isDeploying ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    {deploymentStatus === "IN_PROGRESS"
                      ? "Building..."
                      : deploymentStatus === "QUEUED"
                        ? "Deploying..."
                        : "Processing..."}
                  </>
                ) : (
                  "Deploy"
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-neutral-300">Status:</span>
              <Badge
                className={
                  deploymentStatus === "SUCCEEDED"
                    ? "bg-green-600 text-white"
                    : deploymentStatus === "FAILED"
                      ? "bg-red-600 text-white"
                      : "bg-[#222] text-neutral-300"
                }
              >
                {deploymentStatus === "SUCCEEDED" && (
                  <Check className="mr-1 h-4 w-4" />
                )}
                {deploymentStatus === "FAILED" && (
                  <XCircle className="mr-1 h-4 w-4" />
                )}
                {deploymentStatus}
              </Badge>
            </div>
            {logs && (
              <div
                ref={logsContainerRef}
                className="bg-[#0A0A0A] border border-[#222] text-white p-4 rounded-md font-mono text-sm overflow-auto max-h-[300px]"
              >
                {logs.length === 0 && isDeploying && (
                  <div className="text-neutral-500">Waiting for logs...</div>
                )}
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    <span className="text-neutral-500">
                      [{new Date(log.timestamp).toLocaleTimeString()}]
                    </span>{" "}
                    {log.log}
                  </div>
                ))}
                {isDeploying &&
                  deploymentStatus !== "SUCCEEDED" &&
                  deploymentStatus !== "FAILED" && (
                    <div className="animate-pulse">▋</div>
                  )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
