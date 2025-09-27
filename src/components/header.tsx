"use client";

import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold font-space-grotesk">
              MemeWarp
            </h1>
          </div>
          
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Connect Wallet
          </Button>
        </div>
      </div>
    </header>
  );
}
