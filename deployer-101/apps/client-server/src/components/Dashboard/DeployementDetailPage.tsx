"use client";

import type React from "react";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  Terminal,
  Settings,
  GitBranch,
  Clock,
  ExternalLink,
  Copy,
  ChevronDown,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import {
  useDeploymentsHook,
  useSingleProjectHook,
} from "@/hooks/useProjectHook";
import { useLogs } from "@/hooks/useLogs";
import { DEPLOYMENT_STATUS, DeploymentType } from "@repo/common/types";
import { formatDate } from "@/lib/tools";

export default function DeploymentDashboard({ id }: { id: string }) {
  const [domain, setDomain] = useState("");
  const [selectedDeploymentId, setSelectedDeploymentId] = useState<
    string | null
  >(null);

  const { loading, project } = useSingleProjectHook(id);
  const { deployments, loading: deploymentsLoading } = useDeploymentsHook(id);
  const { logs, fetchLogs } = useLogs(selectedDeploymentId || "");

  useEffect(() => {
    if (deployments.length > 0 && !selectedDeploymentId) {
      setSelectedDeploymentId(deployments[0].id);
    }
  }, [deployments, selectedDeploymentId]);

  useEffect(() => {
    if (selectedDeploymentId) {
      fetchLogs();
    }
  }, [selectedDeploymentId]);

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Adding domain:", domain);
    setDomain("");
  };

  const getStatusIcon = (status: DEPLOYMENT_STATUS) => {
    switch (status) {
      case "SUCCEEDED":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "IN_PROGRESS":
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
      case "CANCELED":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case "QUEUED":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: DEPLOYMENT_STATUS) => {
    switch (status) {
      case "SUCCEEDED":
        return <Badge className="bg-green-500">Succeeded</Badge>;
      case "FAILED":
        return <Badge className="bg-red-500">Error</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-yellow-500">Building</Badge>;
      case "CANCELED":
        return <Badge className="bg-gray-500">Canceled</Badge>;
      case "QUEUED":
        return <Badge className="bg-blue-500">Queued</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getLogLevelClass = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-500";
      case "warning":
        return "text-yellow-500";
      case "info":
      default:
        return "text-blue-500";
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container mx-auto py-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">
              {project?.name || "Project Name"}
            </h1>
            <Button variant="outline" size="sm" asChild>
              <a
                href={project?.subDomain || "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit
              </a>
            </Button>
          </div>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <GitBranch className="mr-1 h-4 w-4" />
            <span className="mr-4">main</span>
            <Clock className="mr-1 h-4 w-4" />
            <span>
              Last deployed{" "}
              {project?.updatedAt ? formatDate(project.updatedAt) : "Recently"}
            </span>
          </div>
        </div>

        <Tabs defaultValue="deployments">
          <TabsList className="mb-4">
            <TabsTrigger value="deployments">
              <Terminal className="mr-2 h-4 w-4" />
              Deployments
            </TabsTrigger>
            <TabsTrigger value="domains">
              <Globe className="mr-2 h-4 w-4" />
              Domains
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deployments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Deployments</CardTitle>
                <CardDescription>
                  View all deployments for this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deploymentsLoading ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : deployments.length === 0 ? (
                    <div className="text-center p-4 text-muted-foreground">
                      No deployments found
                    </div>
                  ) : (
                    deployments.map((deployment: DeploymentType) => (
                      <Collapsible
                        key={deployment.id}
                        open={selectedDeploymentId === deployment.id}
                        onOpenChange={() =>
                          setSelectedDeploymentId(deployment.id)
                        }
                        className="border rounded-lg overflow-hidden"
                      >
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(deployment.status)}
                            <div className="flex flex-col">
                              <div className="font-medium flex items-center gap-2">
                                <span>{`Deployment ${deployment.id.substring(0, 8)}`}</span>
                                {getStatusBadge(deployment.status)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <span className="inline-flex items-center gap-1">
                                  {"main"} <span>•</span>{" "}
                                  {formatDate(deployment.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform ui-open:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="p-4 border-t bg-muted/20">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">Deployment Logs</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={fetchLogs}
                              >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Refresh
                              </Button>
                            </div>
                            {logs && (
                              <div className="bg-[#0A0A0A] border border-[#222] text-white p-4 rounded-md font-mono text-sm overflow-auto max-h-[300px]">
                                {logs.map((log, index) => (
                                  <div key={index} className="mb-1">
                                    <span className="text-neutral-500">
                                      [
                                      {new Date(
                                        log.timestamp
                                      ).toLocaleTimeString()}
                                      ]
                                    </span>{" "}
                                    {log.log}
                                  </div>
                                ))}
                                <div className="py-3">
                                  {deployment.status === "SUCCEEDED" ? (
                                    <span className="border px-4 py-1 rounded-2xl bg-secondary text-green-400">
                                      Deployment Successfull
                                    </span>
                                  ) : (
                                    <span className="border px-4 py-1 rounded-2xl bg-secondary text-red-400">
                                      Deployment failed
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="domains" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add Custom Domain</CardTitle>
                <CardDescription>
                  Connect your project to a custom domain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddDomain} className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="domain" className="sr-only">
                      Domain
                    </Label>
                    <Input
                      id="domain"
                      placeholder="example.com"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                    />
                  </div>
                  <Button type="submit">Add</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Domains</CardTitle>
                <CardDescription>
                  Domains connected to this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center">
                      <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>
                        {project?.subDomain || "project-name.vercel.app"}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
                <CardDescription>Manage your project settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    defaultValue={project?.name || "Project Name"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch">Production Branch</Label>
                  <Input id="branch" defaultValue="main" />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
              <CardFooter className="border-t mt-4 flex flex-col items-start">
                <h3 className="text-lg font-medium mb-2">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Once you delete a project, there is no going back. Please be
                  certain.
                </p>
                <Button variant="destructive">Delete Project</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
