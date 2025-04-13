import Link from "next/link"
import { Github } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/Landing/Navbar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignIn() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
            <CardDescription>Continue with GitHub to sign in to your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" asChild>
              <Link href="/api/auth/github">
                <Github className="mr-2 h-4 w-4" />
                Continue with GitHub
              </Link>
            </Button>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary underline-offset-4 hover:underline">
                Register
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
