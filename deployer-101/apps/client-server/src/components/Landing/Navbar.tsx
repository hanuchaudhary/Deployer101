"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { useEffect } from "react";
import axios from "axios";
import { HTTP_BACKEND_URL } from "@/config";

export function Navbar() {
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      const url = `${HTTP_BACKEND_URL}/api/v1/project`;
      console.log("Fetching user data from:", url);
      const res = await axios.get(url);
      console.log(res.data);
    };
    fetchUser();
  }, []);

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-10">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Deployer101</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium"></nav>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          <SignedOut>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="cursor-pointer"
            >
              <SignInButton />
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="cursor-pointer"
            >
              <SignUpButton />
            </Button>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
