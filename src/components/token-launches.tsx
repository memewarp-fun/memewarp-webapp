"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TokenCard } from "@/components/token-card";
import Link from "next/link";

const mockTokens = [
  {
    id: 1,
    name: "Kuda Slime",
    symbol: "KUDA",
    description: "Kuda slime the biggest",
    mcap: "$16.0K",
    change24h: "+19.92%",
    launched: "9m ago",
    creator: "73PXvV",
    creatorAddress: "0x73PX...vV92",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=kuda&backgroundColor=1f1f1f"
  },
  {
    id: 2,
    name: "Top Blast",
    symbol: "TopBlast",
    description: "PVP Nah PVE Nah This is PVD I'll be your exit liquidity. 50% To just Top Blast Lock or burn y...",
    mcap: "$17.4K",
    change24h: "+27.54%",
    launched: "5m ago",
    creator: "C3UW51",
    creatorAddress: "0xC3UW...5123",
    image: "https://api.dicebear.com/7.x/initials/svg?seed=T&backgroundColor=22c55e"
  },
  {
    id: 3,
    name: "DogeMoon",
    symbol: "DMOON",
    description: "Much wow, very moon. The ultimate doge derivative that will take us beyond the stars",
    mcap: "$945K",
    change24h: "+89.32%",
    launched: "2h ago",
    creator: "A8KL92",
    creatorAddress: "0xA8KL...9234",
    image: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=doge"
  },
  {
    id: 4,
    name: "CatVibes",
    symbol: "VIBES",
    description: "Cats rule the internet, now they rule DeFi. Join the feline revolution",
    mcap: "$2.1M",
    change24h: "+156.78%",
    launched: "4h ago",
    creator: "B5TY23",
    creatorAddress: "0xB5TY...2345",
    image: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=cat"
  },
  {
    id: 5,
    name: "RocketPepe",
    symbol: "RPEPE",
    description: "Pepe going to Mars before Elon. Strap in for the most based journey in crypto",
    mcap: "$750K",
    change24h: "+45.21%",
    launched: "6h ago",
    creator: "K9PL44",
    creatorAddress: "0xK9PL...4456",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=rocket&backgroundColor=6366f1"
  },
  {
    id: 6,
    name: "WojakCry",
    symbol: "WOJAK",
    description: "It's over... or is it just beginning? The most emotional token in the space",
    mcap: "$320K",
    change24h: "+67.89%",
    launched: "8h ago",
    creator: "M2QW87",
    creatorAddress: "0xM2QW...8767",
    image: "https://api.dicebear.com/7.x/personas/svg?seed=wojak"
  }
];

export function TokenLaunches() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tokens')
      .then(res => res.json())
      .then(data => {
        setTokens(data.slice(0, 6));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch tokens:', err);
        setLoading(false);
      });
  }, []);

  const displayTokens = tokens.length > 0 ? tokens : mockTokens;

  return (
    <section className="py-16 bg-black">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold font-space-grotesk text-white">Latest Token Launches</h2>
          <Link href="/tokens">
            <Button variant="outline" className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black">
              View All
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading && tokens.length === 0 ? (
            <>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-zinc-800 rounded-lg" />
                    <div className="flex-1">
                      <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-zinc-800 rounded w-1/2 mb-3" />
                      <div className="h-3 bg-zinc-800 rounded w-full mb-2" />
                      <div className="h-4 bg-zinc-800 rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            displayTokens.map((token) => {
            const timeSinceLaunch = token.createdAt
              ? `${Math.floor((Date.now() - new Date(token.createdAt).getTime()) / (1000 * 60))}m ago`
              : token.launched;

            const change24h = token.priceUSD && token.flowPriceUSD
              ? ((token.flowPriceUSD > token.hederaPriceUSD ? '+' : '-') + Math.abs(((token.flowPriceUSD - token.hederaPriceUSD) / token.priceUSD * 100)).toFixed(2) + '%')
              : token.change24h || '+0.00%';

            return (
              <TokenCard
                key={token.id || token.symbol}
                id={token.id || token.symbol}
                name={token.name}
                symbol={token.symbol || token.id}
                description={token.description || "A new meme token on dual chains"}
                mcap={token.marketCapUSD ? `$${(token.marketCapUSD / 1000).toFixed(1)}K` : token.mcap || "$0"}
                change24h={change24h}
                launched={timeSinceLaunch}
                creator={token.creator?.slice(-6) || token.creator}
                creatorAddress={token.creator || token.creatorAddress}
                image={token.imageUrl || token.image || `https://api.dicebear.com/7.x/shapes/svg?seed=${token.symbol}`}
              />
            );
          }))}
        </div>
      </div>
    </section>
  );
}
