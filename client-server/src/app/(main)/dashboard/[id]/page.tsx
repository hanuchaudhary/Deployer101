"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Globe, Terminal, Settings, GitBranch, Clock, ExternalLink, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/Landing/Navbar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function DeploymentDetails({ params }: { params: { id: string } }) {
  const [domain, setDomain] = useState("")

  // Mock deployment data
  const deployment = {
    id: params.id,
    name: "Next.js Blog",
    url: "https://nextjs-blog.vercel.app",
    branch: "main",
    lastDeployed: "2 hours ago",
    status: "Production",
    domains: ["nextjs-blog.vercel.app", "blog.example.com"],
    logs: [
      { id: "1", message: "Build started", timestamp: "2023-04-13 10:00:00" },
      { id: "2", message: "Installing dependencies", timestamp: "2023-04-13 10:01:00" },
      { id: "3", message: "Running build script", timestamp: "2023-04-13 10:05:00" },
      { id: "4", message: "Build completed", timestamp: "2023-04-13 10:10:00" },
      { id: "5", message: "Deployment successful", timestamp: "2023-04-13 10:12:00" },
    ],
  }

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would add the domain to the deployment
    console.log("Adding domain:", domain)
    setDomain("")
  }

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
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">{deployment.name}</h1>
            <Button variant="outline" size="sm" asChild>
              <a href={deployment.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit
              </a>
            </Button>
          </div>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <GitBranch className="mr-1 h-4 w-4" />
            <span className="mr-4">{deployment.branch}</span>
            <Clock className="mr-1 h-4 w-4" />
            <span>Last deployed {deployment.lastDeployed}</span>
          </div>
        </div>

        <Tabs defaultValue="domains">
          <TabsList className="mb-4">
            <TabsTrigger value="domains">
              <Globe className="mr-2 h-4 w-4" />
              Domains
            </TabsTrigger>
            <TabsTrigger value="logs">
              <Terminal className="mr-2 h-4 w-4" />
              Logs
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="domains" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add Custom Domain</CardTitle>
                <CardDescription>Connect your project to a custom domain</CardDescription>
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
                <CardDescription>Domains connected to this project</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {deployment.domains.map((domain, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center">
                        <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{domain}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Deployment Logs</CardTitle>
                <CardDescription>View the logs for this deployment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-black text-white p-4 rounded-md font-mono text-sm overflow-auto max-h-[500px]">
                  {deployment.logs.map((log) => (
                    <div key={log.id} className="mb-2">
                      <span className="text-gray-400">[{log.timestamp}]</span> {log.message}
                    </div>
                  ))}
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
                  <Input id="project-name" defaultValue={deployment.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch">Production Branch</Label>
                  <Input id="branch" defaultValue={deployment.branch} />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
              <CardFooter className="border-t mt-4 flex flex-col items-start">
                <h3 className="text-lg font-medium mb-2">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Once you delete a project, there is no going back. Please be certain.
                </p>
                <Button variant="destructive">Delete Project</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
