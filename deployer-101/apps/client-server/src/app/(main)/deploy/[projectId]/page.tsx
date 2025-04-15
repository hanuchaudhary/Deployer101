"use client";

import { useState, useEffect } from "react";
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
import { useDomain } from "@/hooks/useDomain";
import { useSingleProjectHook } from "@/hooks/useProjectHook";
import { Progress } from "@/components/ui/progress";

export default function DeployProject({
  params,
}: {
  params: { projectId: string };
}) {
  const { fetchProject, loading, project } = useSingleProjectHook(
    params.projectId
  );

  // State for domain selection
  const [domainType, setDomainType] = useState("generated");
  const [customDomain, setCustomDomain] = useState(project?.subDomain);
  const [generatedDomain, setGeneratedDomain] = useState<string>(
    project?.name || ""
  );

  // State for deployment
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<DEPLOYMENT_STATUS>(
    DEPLOYMENT_STATUS.IDLE
  );
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const { domainResponse, loading: domainLoading, setDomain } = useDomain();
  const [logs, setLogs] = useState<string[]>([]);

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
            <Link href="/dashboard/new">
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
              <div className="flex items-start space-x-3 space-y-0">
                <div className="space-y-2 w-full">
                  <Label htmlFor="generated" className="font-medium">
                    Generated Domain
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center flex-1 bg-[#0A0A0A] border border-[#333] rounded-md overflow-hidden">
                      <Input
                        value={project?.subDomain}
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
            {deploymentStatus === DEPLOYMENT_STATUS.SUCCESS ? (
              <Button
                className="bg-white text-black hover:bg-neutral-200 transition-colors"
                asChild
              >
                <a
                  href={`https://${domainType === "custom" ? customDomain : generatedDomain}.vercel.app`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Site
                  <ChevronRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            ) : (
              <Button
                // onClick={handleDeploy}
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
                    {deploymentStatus === DEPLOYMENT_STATUS.IN_PROGRESS
                      ? "Building..."
                      : deploymentStatus === DEPLOYMENT_STATUS.QUEUED
                        ? "Deploying..."
                        : "Processing..."}
                  </>
                ) : (
                  "Deploy"
                )}
              </Button>
            )}
          </CardHeader>

          {isDeploying && (
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      deploymentStatus === DEPLOYMENT_STATUS.SUCCESS
                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                        : "bg-[#222] text-neutral-300 border-[#333]"
                    }
                  >
                    {deploymentStatus === DEPLOYMENT_STATUS.IDLE
                      ? "Waiting"
                      : deploymentStatus === DEPLOYMENT_STATUS.IN_PROGRESS
                        ? "Building"
                        : deploymentStatus === DEPLOYMENT_STATUS.QUEUED
                          ? "Deploying"
                          : "Completed"}
                  </Badge>
                  {deploymentStatus === DEPLOYMENT_STATUS.SUCCESS && (
                    <span className="text-sm text-green-500 flex items-center">
                      <Check className="h-4 w-4 mr-1" />
                      Deployment successful
                    </span>
                  )}
                </div>

                <div className="w-full">
                  <Progress
                    value={deploymentProgress}
                    className="h-1 bg-[#222]"
                  />
                  <div className="flex justify-between mt-1 text-xs text-neutral-400">
                    <span>Build</span>
                    <span>Deploy</span>
                    <span>Complete</span>
                  </div>
                </div>

                <div className="bg-[#0A0A0A] border border-[#222] text-white p-4 rounded-md font-mono text-sm overflow-auto max-h-[300px]">
                  {logs.map((log, index) => (
                    <div key={index} className="mb-1">
                      <span className="text-neutral-500">
                        [{new Date().toLocaleTimeString()}]
                      </span>{" "}
                      {log}
                    </div>
                  ))}
                  {isDeploying &&
                    deploymentStatus !== DEPLOYMENT_STATUS.SUCCESS && (
                      <div className="animate-pulse">▋</div>
                    )}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </main>
    </div>
  );
}
