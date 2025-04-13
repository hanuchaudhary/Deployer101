import Link from "next/link"
import { PlusCircle, GitBranch, Clock, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/Landing/Navbar"
import { Input } from "@/components/ui/input"

export default function Dashboard() {
  // Mock data for repositories
  const repositories = [
    {
      id: "1",
      name: "Next.js Blog",
      url: "https://github.com/user/nextjs-blog",
      branch: "main",
      lastDeployed: "2 hours ago",
      status: "Production",
    },
    {
      id: "2",
      name: "E-commerce Site",
      url: "https://github.com/user/ecommerce",
      branch: "main",
      lastDeployed: "1 day ago",
      status: "Production",
    },
    {
      id: "3",
      name: "Portfolio",
      url: "https://github.com/user/portfolio",
      branch: "main",
      lastDeployed: "3 days ago",
      status: "Production",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 mx-auto container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Projects</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        <div className="mb-6">
          <Input placeholder="Filter projects..." className="max-w-md" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {repositories.map((repo) => (
            <Card key={repo.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">
                  <Link href={`/dashboard/${repo.id}`} className="hover:underline">
                    {repo.name}
                  </Link>
                </CardTitle>
                <CardDescription className="flex items-center text-xs">
                  <GitBranch className="mr-1 h-3 w-3" />
                  {repo.branch}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>Last deployed {repo.lastDeployed}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <span className="text-xs font-medium">{repo.status}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/${repo.id}`}>
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
  )
}
