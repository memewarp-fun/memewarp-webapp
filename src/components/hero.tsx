"use client";

import { Button } from "@/components/ui/button";
import { GridAnimation } from "@/components/grid-animation";
import { useState, useEffect } from "react";
import Link from "next/link";

export function Hero() {
  const subtitles = [
    "36 hours. 2 blockchains. 1 functioning brain cell. 0 regrets.",
    "Even ChatGPT said this was a bad idea",
    "The mentors tried to stop us"
  ];

  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSubtitleIndex((prev) => (prev + 1) % subtitles.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-full flex items-center justify-center overflow-hidden">
      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-space-grotesk mb-6 bg-gradient-to-r from-primary via-accent-foreground to-primary bg-clip-text text-transparent">
          🏆 ETHGlobal Delhi's Most Questionable Technical Achievement
          </h1>
          <div className="h-16 flex items-center justify-center">
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto transition-opacity duration-500">
              {subtitles[currentSubtitleIndex]}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/create">
              <Button size="lg" className="text-lg px-8 py-6">
                Launch a Token
              </Button>
            </Link>
            {/* <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Start Streaming
            </Button> */}
          </div>
        </div>
      </div>

      {/* Grid animation background */}
      <GridAnimation />
    </section>
  );
}
