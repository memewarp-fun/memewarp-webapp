"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { TokenCardWithCurve } from "@/components/token-card-with-curve";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function TokensPage() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(12);

  useEffect(() => {
    fetch('/api/tokens')
      .then(res => res.json())
      .then(data => {
        setTokens(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const tokensToShow = tokens.slice(0, displayCount);

  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + 12, tokens.length));
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
            {loading ? (
              <>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
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
              tokensToShow.map((token) => {
                const timeSinceLaunch = token.createdAt
                  ? `${Math.floor((Date.now() - new Date(token.createdAt).getTime()) / (1000 * 60 * 60))}h ago`
                  : "Just launched";

                const change24h = token.priceUSD && token.flowPriceUSD
                  ? ((token.flowPriceUSD > token.hederaPriceUSD ? '+' : '-') + Math.abs(((token.flowPriceUSD - token.hederaPriceUSD) / token.priceUSD * 100)).toFixed(2) + '%')
                  : '+0.00%';

                return (
                  <TokenCardWithCurve
                    key={token.id}
                    token={token}
                    change24h={change24h}
                    timeSinceLaunch={timeSinceLaunch}
                  />
                );
              })
            )}
          </div>

          {!loading && displayCount < tokens.length && (
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

          {!loading && tokens.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">No tokens have been launched yet.</p>
              <p className="text-gray-500 mt-2">Be the first to create a meme token!</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}