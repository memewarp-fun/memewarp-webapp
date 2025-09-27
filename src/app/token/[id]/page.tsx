"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ExternalLink, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PriceChart } from "@/components/price-chart";
import { useBondingCurve } from "@/hooks/useBondingCurve";
import { useAccount } from "wagmi";

// Mock chart data
const generateChartData = () => {
  const data = [];
  const basePrice = 0.01;
  for (let i = 0; i < 50; i++) {
    data.push({
      time: i,
      price: basePrice + Math.random() * 0.005 + (i * 0.0001)
    });
  }
  return data;
};

// Mock comments
const mockComments = [
  { id: 1, user: "DegenTrader", avatar: "https://api.dicebear.com/7.x/personas/svg?seed=degen", comment: "This is going to moon! 🚀", time: "2m ago" },
  { id: 2, user: "CryptoWhale", avatar: "https://api.dicebear.com/7.x/personas/svg?seed=whale", comment: "Just aped in with 10 SOL", time: "5m ago" },
  { id: 3, user: "MemeHunter", avatar: "https://api.dicebear.com/7.x/personas/svg?seed=hunter", comment: "Dev is based, community growing fast", time: "12m ago" },
  { id: 4, user: "DiamondHands", avatar: "https://api.dicebear.com/7.x/personas/svg?seed=diamond", comment: "HODL till 100M mcap minimum", time: "15m ago" },
  { id: 5, user: "PaperHands", avatar: "https://api.dicebear.com/7.x/personas/svg?seed=paper", comment: "Taking profits at 2x", time: "18m ago" },
];

const chains = [
  { id: "flow", name: "Flow", symbol: "FLOW", logo: "https://cryptologos.cc/logos/flow-flow-logo.png" },
  { id: "hedera", name: "Hedera", symbol: "HBAR", logo: "https://cryptologos.cc/logos/hedera-hbar-logo.png" },
];

export default function TokenDetailsPage() {
  const params = useParams();
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [selectedChain, setSelectedChain] = useState(chains[0]);
  const [amount, setAmount] = useState("");
  const [timeframe, setTimeframe] = useState("1h");
  const [tokenData, setTokenData] = useState<any>(null);
  const [isTrading, setIsTrading] = useState(false);

  const bondingCurve = useBondingCurve(
    tokenData?.[`${selectedChain.id}Curve`],
    selectedChain.id as 'flow' | 'hedera'
  );

  useEffect(() => {
    fetch(`/api/tokens/${params.id}`)
      .then(res => res.json())
      .then(data => setTokenData(data))
      .catch(console.error);
  }, [params.id]);

  const chartData = generateChartData();
  const maxPrice = Math.max(...chartData.map(d => d.price));
  const minPrice = Math.min(...chartData.map(d => d.price));
  const priceRange = maxPrice - minPrice;

  // Mock livestream data - sometimes a token has active livestream
  const hasLivestream = false; // Math.random() > 0.5; // 50% chance for demo - DISABLED
  const livestreamData = {
    streamer: "CryptoMemer",
    viewers: 1248,
    thumbnail: "https://picsum.photos/seed/stream/640/360",
    title: "🚀 LAUNCHING SILENTHILL TOKEN LIVE!"
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Token Info, Chart, Comments */}
          <div className="lg:col-span-2 space-y-6">
            {/* Livestream Display - if token has active stream */}
            {hasLivestream && (
              <div className="bg-zinc-900 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Live Now</h2>
                  <Badge className="bg-red-500 text-white">
                    <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
                    LIVE
                  </Badge>
                </div>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-800 group cursor-pointer">
                  <img
                    src={livestreamData.thumbnail}
                    alt="Livestream"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                      <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Stream info overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-bold text-lg mb-1">{livestreamData.title}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-200">
                      <span>{livestreamData.streamer}</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                        {livestreamData.viewers.toLocaleString()} watching
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Token Header */}
            <div className="bg-zinc-900 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={`https://api.dicebear.com/7.x/shapes/svg?seed=token${params.id}&backgroundColor=22c55e`}
                    alt="Token"
                    className="w-16 h-16 rounded-xl"
                  />
                  <div>
                    <h1 className="text-2xl font-bold">{tokenData?.name || "Loading..."}</h1>
                    <p className="text-gray-400">${tokenData?.symbol || "..."}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Created by: <Link href={`/profile/${tokenData?.creator}`} className="text-green-500 hover:text-green-400 transition-colors">{tokenData?.creator?.slice(0, 6)}...{tokenData?.creator?.slice(-4)}</Link>
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +3.81%
                </Badge>
              </div>

              {/* Market Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Market Cap</p>
                  <p className="text-xl font-bold">$10.6K</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">24h Volume</p>
                  <p className="text-xl font-bold">2.2K</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">ATH</p>
                  <p className="text-xl font-bold">$10.6K</p>
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-zinc-800 pt-4">
                <p className="text-gray-300">
                  The ultimate meme token for the culture. Join the silent revolution and ride the wave to the moon!
                  Community-driven project with locked liquidity and renounced contract.
                </p>
              </div>
            </div>

            {/* Chart */}
            <PriceChart
              tokenSymbol="SILENTHILL"
              currentPrice={0.0145}
              change24h={3.81}
            />

            {/* Comments Section */}
            <div className="bg-zinc-900 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4">Comments</h2>

              {/* Comment Input */}
              <div className="flex gap-3 mb-6">
                <img
                  src="https://api.dicebear.com/7.x/personas/svg?seed=user"
                  alt="You"
                  className="w-10 h-10 rounded-full"
                />
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="flex-1 bg-zinc-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <Button className="bg-green-500 hover:bg-green-600 text-black">
                  Post
                </Button>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {mockComments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <img
                      src={comment.avatar}
                      alt={comment.user}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{comment.user}</span>
                        <span className="text-sm text-gray-500">{comment.time}</span>
                      </div>
                      <p className="text-gray-300 mt-1">{comment.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Trading Panel */}
          <div className="space-y-6">
            {/* Chain Selector - Moved outside the trading panel */}
            <div className="bg-zinc-900 rounded-2xl p-4">
              <label className="text-sm text-gray-400 mb-2 block">Select Chain</label>
              <div className="grid grid-cols-2 gap-3">
                {chains.map(chain => (
                  <button
                    key={chain.id}
                    onClick={() => setSelectedChain(chain)}
                    className={`py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                      selectedChain.id === chain.id
                        ? "bg-green-500 text-black"
                        : "bg-zinc-800 text-gray-400 hover:bg-zinc-700"
                    }`}
                  >
                    <img src={chain.logo} alt={chain.name} className="w-5 h-5" />
                    <span>{chain.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-6 sticky top-24">
              {/* Tab Switcher */}
              <div className="flex mb-6">
                <button
                  onClick={() => setActiveTab("buy")}
                  className={`flex-1 py-3 font-semibold rounded-l-lg transition-colors ${
                    activeTab === "buy"
                      ? "bg-green-500 text-black"
                      : "bg-zinc-800 text-gray-400"
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setActiveTab("sell")}
                  className={`flex-1 py-3 font-semibold rounded-r-lg transition-colors ${
                    activeTab === "sell"
                      ? "bg-red-500 text-white"
                      : "bg-zinc-800 text-gray-400"
                  }`}
                >
                  Sell
                </button>
              </div>

              {/* Balance Display */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Balance:</span>
                  <span>0.006797 {selectedChain.symbol}</span>
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <div className="bg-zinc-800 rounded-lg p-4">
                  <input
                    type="text"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-transparent text-2xl font-bold outline-none"
                  />
                  <div className="flex gap-2 mt-3">
                    {["Reset", "0.1", "0.5", "1", "Max"].map(preset => (
                      <button
                        key={preset}
                        onClick={() => {
                          if (preset === "Reset") setAmount("");
                          else if (preset === "Max") setAmount("0.006797");
                          else setAmount(preset);
                        }}
                        className="flex-1 py-1 text-xs bg-zinc-700 rounded hover:bg-zinc-600 transition-colors"
                      >
                        {preset} {preset !== "Reset" && preset !== "Max" && selectedChain.symbol}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Slippage Settings */}
              <div className="mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Set max slippage</span>
                  <button className="text-green-500 hover:underline">Auto</button>
                </div>
              </div>

              {/* Trade Button */}
              <Button
                onClick={async () => {
                  if (!amount || !address) return;
                  setIsTrading(true);
                  try {
                    if (activeTab === "buy") {
                      await bondingCurve.buy(amount);
                    } else {
                      await bondingCurve.sell(amount);
                    }
                    setAmount("");
                    await fetch('/api/sync', { method: 'POST' });
                  } catch (error) {
                    console.error('Trade failed:', error);
                  }
                  setIsTrading(false);
                }}
                disabled={isTrading || !amount || !address}
                className={`w-full py-6 text-lg font-bold ${
                  activeTab === "buy"
                    ? "bg-green-500 hover:bg-green-600 text-black"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {isTrading ? "Processing..." : activeTab === "buy" ? `Buy ${tokenData?.symbol || 'TOKEN'}` : `Sell ${tokenData?.symbol || 'TOKEN'}`}
              </Button>

              {/* Position Info */}
              <div className="mt-6 pt-6 border-t border-zinc-800">
                <div className="flex justify-between mb-3">
                  <span className="text-gray-400">Position</span>
                  <span>$0.00 <span className="text-gray-500">0 SILENTHILL</span></span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Trades</span>
                    <span className="text-gray-400">Profit/Loss</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 to-green-500 w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}