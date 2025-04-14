import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import Provider from "@/lib/Provider";
import { Navbar } from "@/components/Landing/Navbar";

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
      <body className={inter.className}>
        <Provider>
          <Navbar/>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </Provider>
      </body>
    </html>
  );
}
