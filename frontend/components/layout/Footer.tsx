import Link from "next/link";
import { MusicIcon } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="grid grid-cols-3">
        <div className="flex text-center justify-center">
          <div className="flex items-center flex-row gap-2">
            <MusicIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Sheet Scan <span className="text-muted-foreground font-mono text-xs">(v0.0.1)</span></span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
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

        <div className="flex items-center justify-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Sheet Scan. All rights reserved.
        </div>
      </div >
    </footer >
  );
}