"use client"

import * as React from "react"
import { Moon, Sun, Sparkles, Layers, CloudMoon } from "lucide-react"

import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-12 h-12 justify-center relative">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 ios-dark:-rotate-90 ios-dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 [.cosmic_&]:-rotate-90 [.cosmic_&]:scale-0 [.glass_&]:-rotate-90 [.glass_&]:scale-0 [.ios-dark_&]:-rotate-90 [.ios-dark_&]:scale-0" />
          <Sparkles className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all cosmic:rotate-0 cosmic:scale-100 [.glass_&]:-rotate-90 [.glass_&]:scale-0 [.ios-dark_&]:-rotate-90 [.ios-dark_&]:scale-0" />
          <Layers className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all glass:rotate-0 glass:scale-100 [.ios-dark_&]:-rotate-90 [.ios-dark_&]:scale-0" />
          <CloudMoon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all ios-dark:rotate-0 ios-dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("cosmic")}>
          <Sparkles className="mr-2 h-4 w-4" />
          <span>Cosmic</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("glass")}>
          <Layers className="mr-2 h-4 w-4" />
          <span>iOS Glass</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("ios-dark")}>
          <CloudMoon className="mr-2 h-4 w-4" />
          <span>iOS Glass Dark</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}