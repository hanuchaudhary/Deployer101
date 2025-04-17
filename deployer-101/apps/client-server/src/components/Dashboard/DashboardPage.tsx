"use client";

import Link from "next/link";
import {
  PlusCircle,
  GitBranch,
  Clock,
  ExternalLink,
  Rocket,
  Code,
  Globe,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useProjectHook } from "@/hooks/useProjectHook";

export default function Dashboard() {
  const { projects, loading } = useProjectHook();
  const hasProjects = projects && projects.length > 0;

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between w-full">
      <div className="leftDiv border-r flex flex-col">
        <div className="border-b p-3 text-center text-sm">
          <span className="font-semibold">Workspace</span>
        </div>
        <div className="mt-4 px-4">
          <Link href="/deploy">
            <Button variant="outline" className="mb-4">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>
      </div>
      <div className="w-full">
        <div className="border-b p-3 text-sm">
          <span className="font-semibold">Projects</span>
        </div>
        {!hasProjects ? (
          <div className="flex flex-col items-center justify-center text-center w-full h-[80%]">
            <div className="mb-6">
              <div className="rounded-full bg-muted p-6 inline-block mb-4">
                <Rocket className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No projects yet</h2>
              <p className="text-muted-foreground max-w-md mb-8">
                You haven't created any deployments yet. Create your first
                project to get started.
              </p>
              <div className="flex items-center justify-center">
                <Link href="/deploy">
                  <Button size="sm" className="mr-2" variant={"outline"}>
                    Create First Project
                  </Button>
                </Link>
                <Link href="/documentation">
                  <Button variant="secondary" size="sm">
                    View Documentation
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Projects</h1>
              <Link href="/deploy">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </Link>
            </div>

            <div className="mb-6">
              <Input placeholder="Filter projects..." className="max-w-md" />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card key={project.id} className="overflow-hidden border-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">
                      <Link
                        href={`/deploy/${project.id}`}
                        className="hover:underline"
                      >
                        {project.name}
                      </Link>
                    </CardTitle>
                    <CardDescription className="flex items-center text-xs">
                      <GitBranch className="mr-1 h-3 w-3" />
                      {project.githubRepoUrl}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>
                        Last deployed{" "}
                        {new Date(project.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <span className="text-xs font-medium">{project.name}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/${project.id}`}>
                          <ExternalLink className="mr-1 h-3 w-3" />
                          View
                        </Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
