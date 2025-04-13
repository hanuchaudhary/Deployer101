"use client";

import Link from "next/link";
import { ArrowLeft, Github, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/Landing/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { getUserRepos } from "@/hooks/GithubRepo";
import { useEffect } from "react";

export default function NewProject() {
  // Mock data for GitHub repositories

  useEffect(() => {
    getUserRepos("hanuchaudhary").then((repos) => {
      console.log(repos);
    });
  }, []);

  const repositories = [
    {
      id: "repo1",
      name: "user/next-blog",
      description: "A blog built with Next.js",
      updatedAt: "Updated 2 days ago",
      language: "TypeScript",
    },
    {
      id: "repo2",
      name: "user/portfolio-site",
      description: "Personal portfolio website",
      updatedAt: "Updated 1 week ago",
      language: "JavaScript",
    },
    {
      id: "repo3",
      name: "user/e-commerce",
      description: "E-commerce platform with Next.js and Stripe",
      updatedAt: "Updated 3 days ago",
      language: "TypeScript",
    },
    {
      id: "repo4",
      name: "user/dashboard-ui",
      description: "Admin dashboard UI components",
      updatedAt: "Updated 5 days ago",
      language: "TypeScript",
    },
    {
      id: "repo5",
      name: "user/api-service",
      description: "RESTful API service with Express",
      updatedAt: "Updated 2 weeks ago",
      language: "JavaScript",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto py-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Import Git Repository</h1>
          <p className="text-muted-foreground mt-2">
            Select a Git repository to deploy your project from.
          </p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search repositories..." className="pl-10" />
          </div>
        </div>

        <div className="space-y-4">
          {repositories.map((repo) => (
            <Card key={repo.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Github className="mr-2 h-5 w-5" />
                      <h3 className="font-medium">{repo.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {repo.description}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground mt-2">
                      <span className="mr-4">{repo.updatedAt}</span>
                      <span>{repo.language}</span>
                    </div>
                  </div>
                  <Button asChild>
                    <Link href={`/deploy/${repo.id}`}>Deploy</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
