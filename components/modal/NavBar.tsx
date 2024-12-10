"use client";

import Link from "next/link";
import { Github, Sun } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon } from "lucide-react";

export default function NavBar() {
  const { setTheme, theme } = useTheme();

  return (
    <div className="p-4">
      <NavigationMenu className="max-w-4xl mx-auto">
        <NavigationMenuList className="w-full flex items-center justify-between px-4 py-2 bg-muted rounded-full border">
          <div className="flex items-center space-x-4">
            <NavigationMenuItem>
              <Link
                href="https://github.com/yourusername/yourrepo"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-foreground/80 transition-colors"
              >
                <Github className="h-5 w-5" />
                <span className="hidden sm:inline">GitHub</span>
              </Link>
            </NavigationMenuItem>

            <Separator orientation="vertical" className="h-6" />

            <NavigationMenuItem>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="rounded-full hover:bg-background"
                aria-label="Toggle theme"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </NavigationMenuItem>
          </div>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}