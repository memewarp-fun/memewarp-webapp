"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LivestreamCard } from "@/components/livestream-card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Generate more mock livestreams
const generateMockLivestreams = () => {
  const streams = [];
  const streamers = ["Clash", "San", "Butthole", "MoonShot", "DiamondHands", "PepeLord", "CryptoChad", "DegenKing", "ApeMaster", "WhaleHunter"];
  const usernames = ["5pY8pTko", "E2TRt6M7", "AuyuBlkf", "K9PL44XX", "B5TY23QW", "M2QW87ZX", "R4TY89PL", "V7UI23KL", "H8QW34RT", "J6PL78MN"];
  const titles = [
    "🚀 LAUNCHING NEW TOKEN LIVE! GET IN EARLY!",
    "Battle Giveaway Farm in Description | 15 Discord",
    "MASSIVE AIRDROP - JOIN NOW! 💰",
    "Trading Live - 100x Gems Only",
    "Meme Coin Review - Which Will Moon?",
    "DEGEN HOUR - High Risk High Reward",
    "Building Community Token LIVE",
    "Market Analysis & Price Predictions",
    "NFT + Token Launch Combo Event",
    "Whale Watching - Big Moves Alert"
  ];

  for (let i = 0; i < 40; i++) {
    const baseIndex = i % 10;
    streams.push({
      id: i + 1,
      streamer: `${streamers[baseIndex]}${i > 9 ? `_${Math.floor(i/10)}` : ''}`,
      username: usernames[baseIndex],
      mcap: `$${(Math.random() * 20).toFixed(1)}M`,
      ath: `$${(Math.random() * 30 + 10).toFixed(1)}M`,
      thumbnail: `https://picsum.photos/seed/stream${i}/640/360`,
      avatar: `https://api.dicebear.com/7.x/personas/svg?seed=${streamers[baseIndex]}${i}`,
      isLive: Math.random() > 0.2,
      streamTitle: titles[baseIndex]
    });
  }
  return streams;
};

const mockStreams = generateMockLivestreams();

export default function LivestreamsPage() {
  const [displayCount, setDisplayCount] = useState(12);
  const streamsToShow = mockStreams.slice(0, displayCount);

  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + 12, mockStreams.length));
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />

      <main className="pt-8 pb-16">
        <div className="container mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold font-space-grotesk text-white mb-2">All Livestreams</h1>
            <p className="text-gray-400">Watch live token launches and crypto content</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {streamsToShow.map((stream) => (
              <LivestreamCard
                key={stream.id}
                streamer={stream.streamer}
                username={stream.username}
                mcap={stream.mcap}
                ath={stream.ath}
                thumbnail={stream.thumbnail}
                avatar={stream.avatar}
                isLive={stream.isLive}
                streamTitle={stream.streamTitle}
              />
            ))}
          </div>

          {displayCount < mockStreams.length && (
            <div className="text-center">
              <Button
                onClick={loadMore}
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-black font-bold"
              >
                Load More Streams
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}