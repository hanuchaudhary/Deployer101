"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export function Navbar() {
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
