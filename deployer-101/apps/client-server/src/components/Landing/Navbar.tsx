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
    <header className="w-full flex items-center justify-between px-4 py-3">
      <div className="w-1/4">{/* Left spacer */}</div>
      <div className="w-2/4 flex justify-center">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-sm">Deployer101</span>
        </Link>
      </div>
      <div className="w-1/4 flex justify-end items-center space-x-4">
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
    </header>
  );
}
