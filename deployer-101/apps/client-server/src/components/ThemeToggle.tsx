"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [isDark, setIsDark] = useState(theme === "dark")

  const toggleTheme = (checked: boolean) => {
    setIsDark(checked)
    setTheme(checked ? "dark" : "light")
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch id="theme-mode" checked={isDark} onCheckedChange={toggleTheme} />
      <Label htmlFor="theme-mode" className="sr-only">
        Toggle theme
      </Label>
      {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </div>
  )
}
