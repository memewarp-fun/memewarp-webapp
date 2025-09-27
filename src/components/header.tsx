"use client";

import Link from "next/link";
import { CustomConnectButton } from "@/components/custom-connect-button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <h1 className="text-2xl font-bold font-space-grotesk hover:text-green-500 transition-colors">
                MemeWarp
              </h1>
            </Link>

            <nav className="flex items-center space-x-6">
              <Link
                href="/tokens"
                className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
              >
                Tokens
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-500 group-hover:w-full transition-all duration-300"></span>
              </Link>

              <Link
                href="/livestreams"
                className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
              >
                Livestreams
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </nav>
          </div>

          <CustomConnectButton />
        </div>
      </div>
    </header>
  );
}
