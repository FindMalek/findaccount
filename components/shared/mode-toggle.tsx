"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark")
    else setTheme("light")
  }

  return (
    <Button variant="outline" className="size-8 px-4" onClick={cycleTheme}>
      <Icons.sun className="absolute size-[1.2rem] rotate-0 scale-100 opacity-50 transition-all dark:rotate-90 dark:scale-0" />
      <Icons.moon className="absolute size-[1.2rem] rotate-90 scale-0 opacity-50 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
