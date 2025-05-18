"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";
import { MusicIcon } from "lucide-react";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Scan", path: "/scan" },
  { name: "Editor", path: "/editor" },
  { name: "Analysis", path: "/analysis" },
  { name: "History", path: "/history" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <MusicIcon className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Sheet Scan</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.path
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button asChild variant="ghost" size="sm" className="hidden md:flex">
            <Link href="/scan">Scan New</Link>
          </Button>
          <Button asChild size="sm" className="hidden md:flex">
            <Link href="/scan">
              <span>Get Started</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}