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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your projects...</p>
        </div>
      </div>
    );
  }

  // Empty state UI
  if (!hasProjects) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 mx-auto container py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 shadow-lg">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-3xl font-bold">
                  Welcome to Your Deployment Dashboard
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  Get started by creating your first project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 pt-6">
                <div className="flex justify-center">
                  <Link href="/deploy">
                    <Button size="lg" className="px-8 py-6 text-lg">
                      <PlusCircle className="mr-2 h-5 w-5" />
                      Create Your First Project
                    </Button>
                  </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <Card className="bg-card/50">
                    <CardHeader>
                      <Rocket className="h-8 w-8 text-primary mb-2" />
                      <CardTitle className="text-xl">
                        Fast Deployments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Deploy your projects in seconds with our streamlined
                        deployment process.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50">
                    <CardHeader>
                      <Code className="h-8 w-8 text-primary mb-2" />
                      <CardTitle className="text-xl">
                        GitHub Integration
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Connect your GitHub repositories for automatic
                        deployments on every push.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50">
                    <CardHeader>
                      <Globe className="h-8 w-8 text-primary mb-2" />
                      <CardTitle className="text-xl">Custom Domains</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Use your own domain or get a free subdomain for your
                        projects.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-6 pb-6">
                <p className="text-sm text-muted-foreground max-w-md text-center">
                  Need help getting started? Check out our{" "}
                  <a href="#" className="text-primary hover:underline">
                    documentation
                  </a>{" "}
                  or{" "}
                  <a href="#" className="text-primary hover:underline">
                    contact support
                  </a>
                  .
                </p>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Projects list UI (original)
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 mx-auto container py-6">
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
                  <Link href={`/deploy/${project.id}`} className="hover:underline">
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
                  <span>Last deployed {new Date(project.createdAt).toLocaleString()}</span>
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
      </main>
    </div>
  );
}
