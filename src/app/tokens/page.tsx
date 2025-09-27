"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { TokenCard } from "@/components/token-card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Generate more mock tokens
const generateMockTokens = () => {
  const tokens = [];
  const names = ["PepeCoin", "DogeMax", "CatVibes", "RocketMeme", "MoonShot", "DiamondHands", "WojakCry", "ChadToken", "ShibaKing", "ElonDoge"];
  const symbols = ["PEPE", "DMAX", "VIBES", "ROCKET", "MOON", "DIAMOND", "WOJAK", "CHAD", "SHIBA", "EDOGE"];
  const creators = ["73PXvV", "C3UW51", "A8KL92", "B5TY23", "K9PL44", "M2QW87", "X1RT56", "P9KL23", "Q5WE78", "N3CV89"];

  for (let i = 0; i < 50; i++) {
    const baseIndex = i % 10;
    tokens.push({
      id: i + 1,
      name: `${names[baseIndex]}${i > 9 ? ` ${Math.floor(i/10)}` : ''}`,
      symbol: `${symbols[baseIndex]}${i > 9 ? Math.floor(i/10) : ''}`,
      description: `The ultimate ${names[baseIndex].toLowerCase()} token for the culture. Join the revolution!`,
      mcap: `$${(Math.random() * 10).toFixed(1)}M`,
      change24h: `+${(Math.random() * 200).toFixed(2)}%`,
      launched: `${Math.floor(Math.random() * 24)}h ago`,
      creator: creators[baseIndex],
      image: `https://api.dicebear.com/7.x/shapes/svg?seed=${names[baseIndex]}${i}&backgroundColor=${Math.random() > 0.5 ? '1f1f1f' : '22c55e'}`
    });
  }
  return tokens;
};

const mockTokens = generateMockTokens();

export default function TokensPage() {
  const [displayCount, setDisplayCount] = useState(12);
  const tokensToShow = mockTokens.slice(0, displayCount);

  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + 12, mockTokens.length));
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main className="pt-8 pb-16">
        <div className="container mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold font-space-grotesk text-white mb-2">All Token Launches</h1>
            <p className="text-gray-400">Discover and invest in the latest meme token launches</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {tokensToShow.map((token) => (
              <TokenCard
                key={token.id}
                id={token.id}
                name={token.name}
                symbol={token.symbol}
                description={token.description}
                mcap={token.mcap}
                change24h={token.change24h}
                launched={token.launched}
                creator={token.creator}
                image={token.image}
              />
            ))}
          </div>

          {displayCount < mockTokens.length && (
            <div className="text-center">
              <Button
                onClick={loadMore}
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-black font-bold"
              >
                Load More Tokens
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}