"use client";

import { useState } from "react";
import { Github, Search, Lock, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RepoType, useGithubRepos } from "@/hooks/useGithubRepos";
import { useUser } from "@clerk/nextjs";
import { CreateProjectDialog } from "@/components/Dashboard/CreateProjectDialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const { repos, loading } = useGithubRepos();
  const { user } = useUser();
  
  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Let&apos;s build something new.
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            To deploy a new Project, import an existing Git Repository or get
            started with one of our Templates.
          </p>
        </div>

        <div className="transition-all duration-300 ease-in-out">
          {/* Import Git Repository Section */}
          <div className="bg-[#111] border border-[#333] rounded-lg p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Github className="h-5 w-5 text-neutral-400" />
              Import Git Repository
            </h2>

            <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
              <Select defaultValue={user?.username || "user"}>
                <SelectTrigger className="bg-[#111] border-[#333] text-white w-full md:w-auto">
                  <div className="flex items-center gap-2">
                    <Github className="h-5 w-5" />
                    <SelectValue placeholder="Select account" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-[#333] text-white">
                  <SelectItem value={user?.username || "user"}>{user?.username || "User"}</SelectItem>
                  <SelectItem value="org1">My Organization</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-full">
                <div className="flex items-center bg-[#111] border border-[#333] rounded-lg overflow-hidden transition-all duration-200 hover:border-[#444] focus-within:border-[#666]">
                  <div className="flex items-center px-4 py-2 border-r border-[#333]">
                    <span className="text-neutral-400">
                      <Search className="h-4 w-4" />
                    </span>
                  </div>
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a repository..."
                    className="bg-transparent border-0 m-1 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="space-y-2 animate-fade-in">
                {Array.from({ length: 5 }).map((_, index) => (
                  <RepoSkeleton key={index} />
                ))}
              </div>
            ) : filteredRepos.length > 0 ? (
              <div className="space-y-1 divide-y divide-[#222]">
                {filteredRepos.map((repo) => (
                  <div
                    key={repo.name}
                    className="flex items-center justify-between py-4 px-3 hover:bg-[#1a1a1a] rounded-md transition-colors duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-gradient-to-br from-[#333] to-[#222] flex items-center justify-center font-semibold text-white shadow-md">
                        {repo.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium group-hover:text-white transition-colors duration-200">
                            {repo.name}
                          </span>
                          {repo.isPrivate && (
                            <Lock className="h-3 w-3 text-neutral-400" />
                          )}
                        </div>
                        <div className="text-sm text-neutral-400">
                          {repo.updatedAt}
                        </div>
                      </div>
                    </div>
                    <CreateProjectDialog repository={repo} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-[#333] rounded-lg">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <Search className="h-10 w-10 text-neutral-500" />
                  <h3 className="text-lg font-medium text-neutral-300">No repositories found</h3>
                  <p className="text-neutral-500 max-w-md">
                    {searchQuery 
                      ? `We couldn't find any repositories matching "${searchQuery}"`
                      : "Connect your GitHub account to import repositories"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RepoSkeleton() {
  return (
    <div className="flex items-center justify-between py-4 px-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-md bg-[#222]" />
        <div>
          <Skeleton className="h-5 w-32 bg-[#222] mb-2" />
          <Skeleton className="h-4 w-24 bg-[#222]" />
        </div>
      </div>
      <Skeleton className="h-9 w-20 bg-[#222] rounded-md" />
    </div>
  );
}
