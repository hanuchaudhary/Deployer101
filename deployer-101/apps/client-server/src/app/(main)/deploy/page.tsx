"use client";

import { useState } from "react";
import Link from "next/link";
import { Github, Search, Lock, ArrowRight, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGithubRepos } from "@/hooks/useGithubRepos";
import { useUser } from "@clerk/nextjs";

export default function ImportPage() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");

  const { repos, loading } = useGithubRepos();
  console.log("repos", repos);

  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Let&apos;s build something new.
          </h1>
          <p className="text-neutral-400 text-lg">
            To deploy a new Project, import an existing Git Repository or get
            started with one of our Templates.
          </p>
        </div>

        {/* AI Command Bar */}
        <div className="relative max-w-3xl mx-auto mb-12">
          <div className="flex items-center bg-[#111] border border-[#333] rounded-lg overflow-hidden">
            <div className="flex items-center px-4 py-2 border-r border-[#333]">
              <span className="text-neutral-400 font-mono">v0</span>
            </div>
            <Input
              placeholder="Ask v0 to build something..."
              className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
            />
            <div className="flex items-center gap-2 px-4">
              <Button variant="ghost" size="icon" className="text-neutral-400">
                <Search className="h-4 w-4" />
              </Button>
              <Button className="bg-white text-black hover:bg-neutral-200">
                Build It <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="">
          {/* Import Git Repository Section */}
          <div className="bg-[#111] border border-[#333] rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Import Git Repository</h2>

            <div className="flex gap-4 mb-6">
              <Select defaultValue="hanuchaudhary">
                <SelectTrigger className="bg-[#111] border-[#333] text-white">
                  <div className="flex items-center gap-2">
                    <Github className="h-5 w-5" />
                    <SelectValue placeholder="Select account" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-[#333] text-white">
                  <SelectItem value="hanuchaudhary">hanuchaudhary</SelectItem>
                  <SelectItem value="org1">My Organization</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <Input
                  placeholder="Search..."
                  className="bg-[#111] border-[#333] text-white pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              {filteredRepos.map((repo) => (
                <div
                  key={repo.name}
                  className="flex items-center justify-between py-4 px-3 hover:bg-[#1a1a1a] rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#222] flex items-center justify-center">
                      {repo.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{repo.name}</span>
                        {repo.isPrivate && (
                          <Lock className="h-3 w-3 text-neutral-400" />
                        )}
                      </div>
                      <div className="text-sm text-neutral-400">
                        {repo.updatedAt}
                      </div>
                    </div>
                  </div>
                  <Link href={`/deploy/p/?owner=${user?.username}&repo=${repo.name}`}>
                    <Button
                      variant="outline"
                      className="border-[#333] hover:bg-[#222]"
                    >
                      Import
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
