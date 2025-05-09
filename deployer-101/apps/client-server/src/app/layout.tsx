import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import Provider from "@/lib/Provider";
import { Navbar } from "@/components/Landing/Navbar";
import { Toaster } from "sonner";
import Sidebar from "@/components/Dashboard/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Vercel Clone",
  description: "A clone of Vercel's deployment platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} dark:bg-black`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Provider>
            <Navbar />
            <main className="flex flex-col md:flex-row">
              <Sidebar />
              <div className="flex w-full border-t border-l rounded-tl-2xl h-[calc(100vh-55px)]">{children}</div>
            </main>
            <Toaster richColors />
          </Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
