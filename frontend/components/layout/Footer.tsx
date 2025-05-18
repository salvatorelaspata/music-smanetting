import Link from "next/link";
import { MusicIcon } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <MusicIcon className="h-5 w-5" />
          <span className="text-sm font-medium">Sheet Scan</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
          <Link href="/help" className="hover:text-foreground">
            Help
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
        </div>
        
        <div className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Sheet Scan. All rights reserved.
        </div>
      </div>
    </footer>
  );
}