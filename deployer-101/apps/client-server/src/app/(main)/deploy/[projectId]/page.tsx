"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Check, RefreshCw } from "lucide-react";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";
import { DEPLOYMENT_STATUS } from "@repo/common/types";
import { generateRandomSubdomain } from "@/lib/generateRandomSlug";
import { useDomain } from "@/hooks/useDomain";
import { useSingleProjectHook } from "@/hooks/useProjectHook";

export default function DeployProject({
  params,
}: {
  params: { projectId: string };
}) {
  console.log("params", params);

  const { fetchProject, loading, project } = useSingleProjectHook(
    params.projectId
  );

  console.log("project", project);

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
  const { domainResponse, loading: domainLoading, setDomain } = useDomain();
  const [logs, setLogs] = useState<string[]>([]);

  // Generate a random domain when component mounts
  useEffect(() => {
    const randomSubDomain = generateRandomSubdomain();
    setGeneratedDomain(randomSubDomain);
  }, []);

  // Function to generate a new random domain
  const generateNewDomain = () => {
    const randomSubDomain = generateRandomSubdomain();
    setGeneratedDomain(randomSubDomain);
  };

  // Handle deployment
  const handleDeploy = () => {
    setIsDeploying(true);
    setDeploymentStatus(DEPLOYMENT_STATUS.READY);

    // Simulate deployment process with logs
    const deploymentSteps = [
      "Cloning repository...",
      "Installing dependencies...",
      "Running build script...",
      "Optimizing assets...",
      "Compressing files...",
      "Running post-build checks...",
      "Deploying to production...",
      "Assigning domain...",
      "Deployment complete!",
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < deploymentSteps.length) {
        setLogs((prev) => [...prev, deploymentSteps[step]]);

        if (step === 2) {
          setDeploymentStatus(DEPLOYMENT_STATUS.IN_PROGRESS);
        } else if (step === 6) {
          setDeploymentStatus(DEPLOYMENT_STATUS.IN_PROGRESS);
        } else if (step === deploymentSteps.length - 1) {
          setDeploymentStatus(DEPLOYMENT_STATUS.SUCCESS);
          clearInterval(interval);
        }

        step++;
      } else {
        clearInterval(interval);
      }
    }, 1500);

    return () => clearInterval(interval);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container mx-auto py-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/dashboard/new">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Import
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Deploy {project?.name}</h1>
          <p className="text-muted-foreground mt-2">
            Configure your deployment settings
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Domain Settings</CardTitle>
              <CardDescription>
                Choose how you want to access your project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={domainType}
                onValueChange={setDomainType}
                className="space-y-4"
              >
                <div className="flex items-start space-x-3 space-y-0">
                  <RadioGroupItem value="generated" id="generated" />
                  <div className="space-y-2 w-full">
                    <Label htmlFor="generated" className="font-medium">
                      Generated Domain
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={generatedDomain}
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={generateNewDomain}
                        type="button"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 space-y-0">
                  <RadioGroupItem value="custom" id="custom" />
                  <div className="space-y-2 w-full">
                    <Label htmlFor="custom" className="font-medium">
                      Custom Domain
                    </Label>
                    <Input
                      placeholder="your-domain.com"
                      onChange={async (e) => {
                        try {
                          setDomain(e.target.value);
                        } catch (error) {
                          console.log(error);
                        }
                      }}
                      disabled={domainType !== "custom"}
                    />
                    <div>
                      {domainLoading ? (
                        <span className="text-sm text-muted-foreground">
                          Searching if domain is available...
                        </span>
                      ) : (
                        domainResponse && (
                          <span className="text-sm text-green-500">
                            {domainResponse}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deployment Settings</CardTitle>
              <CardDescription>
                Configure build and environment settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Framework Preset</Label>
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <span>Next.js</span>
                  <Badge>Detected</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Root Directory</Label>
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <span>./</span>
                  <Badge>Default</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Node.js Version</Label>
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <span>18.x</span>
                  <Badge>Default</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Deployment</CardTitle>
              <CardDescription>
                Deploy your project to production
              </CardDescription>
            </div>
            {deploymentStatus === DEPLOYMENT_STATUS.SUCCESS ? (
              <Button variant="outline" asChild>
                <a
                  href={`https://${
                    domainType === "custom" ? customDomain : generatedDomain
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Site
                </a>
              </Button>
            ) : (
              <Button onClick={handleDeploy} disabled={isDeploying}>
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
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      deploymentStatus === DEPLOYMENT_STATUS.SUCCESS
                        ? "default"
                        : "outline"
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
                    <span className="text-sm text-muted-foreground flex items-center">
                      <Check className="h-4 w-4 mr-1 text-green-500" />
                      Deployment successful
                    </span>
                  )}
                </div>

                <div className="bg-black text-white p-4 rounded-md font-mono text-sm overflow-auto max-h-[300px]">
                  {logs.map((log, index) => (
                    <div key={index} className="mb-1">
                      <span className="text-gray-400">
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
