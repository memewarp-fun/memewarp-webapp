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
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useAccount, useBalance } from "wagmi";
import { TransactionModal } from "@/components/transaction-modal";

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
  { id: "flow", name: "Flow", symbol: "FLOW", logo: "/flow-logo.png" },
  { id: "hedera", name: "Hedera", symbol: "HBAR", logo: "/hedera-logo.png" },
];

// Component for dual chain prices
const DualChainPrices = ({ tokenData }: { tokenData: any }) => {
  const flowCurve = useBondingCurve(tokenData?.flowCurve || '', 'flow');
  const hederaCurve = useBondingCurve(tokenData?.hederaCurve || '', 'hedera');
  const [usdPrices, setUsdPrices] = useState<{ flowUsd: number; hbarUsd: number } | null>(null);

  useEffect(() => {
    import('@/lib/pyth').then(({ getPrices }) => {
      getPrices().then(setUsdPrices).catch(() => {});
    });
  }, []);

  const flowPriceUsd = usdPrices ? (flowCurve.currentPrice * usdPrices.flowUsd) : 0;
  const hederaPriceUsd = usdPrices ? (hederaCurve.currentPrice * usdPrices.hbarUsd) : 0;

  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-zinc-800/50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <img src="/flow-logo.png" alt="Flow" className="w-4 h-4" />
          <p className="text-gray-400 text-sm">Flow Price</p>
        </div>
        <p className="text-xl font-bold">
          {flowCurve.currentPrice.toFixed(8)} FLOW
        </p>
        {usdPrices && (
          <p className="text-sm text-gray-400">
            ${flowPriceUsd.toFixed(6)} USD
          </p>
        )}
      </div>
      <div className="bg-zinc-800/50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <img src="/hedera-logo.png" alt="Hedera" className="w-4 h-4" />
          <p className="text-gray-400 text-sm">Hedera Price</p>
        </div>
        <p className="text-xl font-bold">
          {hederaCurve.currentPrice.toFixed(8)} HBAR
        </p>
        {usdPrices && (
          <p className="text-sm text-gray-400">
            ${hederaPriceUsd.toFixed(6)} USD
          </p>
        )}
      </div>
    </div>
  );
};

export default function TokenDetailsPage() {
  const params = useParams();
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [selectedChain, setSelectedChain] = useState(chains[0]);
  const [amount, setAmount] = useState("");
  const [timeframe, setTimeframe] = useState("1h");
  const [tokenData, setTokenData] = useState<any>(null);
  const [isTrading, setIsTrading] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [tokenAmount, setTokenAmount] = useState<string>("");
  const [otherChainSupply, setOtherChainSupply] = useState<number>(0);
  const [txModal, setTxModal] = useState<{
    isOpen: boolean;
    status: 'processing' | 'success' | 'error';
    txHash?: string;
    error?: string;
    action?: string;
    amount?: string;
    token?: string;
  }>({
    isOpen: false,
    status: 'processing'
  });

  const [balanceKey, setBalanceKey] = useState(0); // Force balance refresh

  const bondingCurve = useBondingCurve(
    tokenData?.[`${selectedChain.id}Curve`],
    selectedChain.id as 'flow' | 'hedera'
  );

  const { balance: tokenBalance, refetch: refetchBalance } = useTokenBalance(
    tokenData?.[`${selectedChain.id}Address`],
    address,
    selectedChain.id as 'flow' | 'hedera',
    balanceKey
  );

  const { data: nativeBalance } = useBalance({
    address: address as `0x${string}`,
    chainId: selectedChain.id === 'flow' ? 747 : 295
  });

  useEffect(() => {
    fetch(`/api/tokens/${params.id}`)
      .then(res => res.json())
      .then(data => setTokenData(data))
      .catch(() => {});
  }, [params.id]);

  // Fetch other chain supply
  useEffect(() => {
    if (!tokenData) return;

    const fetchOtherChainSupply = async () => {
      const otherChain = selectedChain.id === 'flow' ? 'hedera' : 'flow';
      const otherCurveAddress = tokenData[`${otherChain}Curve`];

      if (!otherCurveAddress || otherCurveAddress === '0x0000000000000000000000000000000000000000') {
        setOtherChainSupply(0);
        return;
      }

      try {
        const { ethers } = await import('ethers');
        const CONTRACTS = {
          flow: { chainId: 747, rpc: "https://mainnet.evm.nodes.onflow.org" },
          hedera: { chainId: 295, rpc: "https://lingering-quaint-snowflake.hedera-mainnet.quiknode.pro/9877f9930868999a28c2635f801dc1c8d030d7d5" }
        };

        const provider = new ethers.providers.JsonRpcProvider(
          CONTRACTS[otherChain as 'flow' | 'hedera'].rpc,
          { chainId: CONTRACTS[otherChain as 'flow' | 'hedera'].chainId, name: otherChain }
        );

        const curveAbi = ["function state() view returns (uint256 localSupply, uint256 otherChainSupply, uint256 globalSupply, uint256 reserveBalance, bool isGraduated, address pool)"];
        const curve = new ethers.Contract(otherCurveAddress, curveAbi, provider);
        const state = await curve.state();
        const supply = state.localSupply || state[0];
        setOtherChainSupply(parseFloat(ethers.utils.formatEther(supply || 0)));
      } catch (error) {
        setOtherChainSupply(0);
      }
    };

    fetchOtherChainSupply();
    const interval = setInterval(fetchOtherChainSupply, 5000);
    return () => clearInterval(interval);
  }, [tokenData, selectedChain.id]);

  useEffect(() => {
    // Debounce the quote calculation
    const timeoutId = setTimeout(() => {
      if (amount && parseFloat(amount) > 0) {
        if (activeTab === 'buy' && bondingCurve.calculateTokensForPayment) {
          // For buy: amount is FLOW/HBAR to spend
          bondingCurve.calculateTokensForPayment(amount)
            .then(result => {
              if (result) {
                setTokenAmount(result.tokens);
                setQuote(result);
              } else {
                setTokenAmount("");
                setQuote(null);
              }
            })
            .catch(() => {
              setTokenAmount("");
              setQuote(null);
            });
        } else if (activeTab === 'sell' && bondingCurve.getQuote) {
          // For sell: amount is tokens to sell
          setTokenAmount(amount);
          bondingCurve.getQuote(amount, 'sell')
            .then(setQuote)
            .catch(() => setQuote(null));
        }
      } else {
        setQuote(null);
        setTokenAmount("");
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [amount, activeTab, bondingCurve]);

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

              {/* Dual Chain Prices */}
              <DualChainPrices tokenData={tokenData} />

              {/* Contract Addresses */}
              <div className="border-t border-zinc-800 pt-4 space-y-3">
                <div>
                  <p className="text-gray-400 text-xs uppercase mb-2">Token Addresses</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <img src="/flow-logo.png" alt="Flow" className="w-3 h-3" />
                        <span className="text-gray-400">Flow:</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://evm.flowscan.io/address/${tokenData?.flowAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors font-mono text-xs"
                        >
                          {tokenData?.flowAddress?.slice(0, 6)}...{tokenData?.flowAddress?.slice(-4)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={() => navigator.clipboard.writeText(tokenData?.flowAddress || '')}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <img src="/hedera-logo.png" alt="Hedera" className="w-3 h-3" />
                        <span className="text-gray-400">Hedera:</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://hashscan.io/mainnet/address/${tokenData?.hederaAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors font-mono text-xs"
                        >
                          {tokenData?.hederaAddress?.slice(0, 6)}...{tokenData?.hederaAddress?.slice(-4)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={() => navigator.clipboard.writeText(tokenData?.hederaAddress || '')}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-xs uppercase mb-2">Bonding Curve Addresses</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <img src="/flow-logo.png" alt="Flow" className="w-3 h-3" />
                        <span className="text-gray-400">Flow:</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://evm.flowscan.io/address/${tokenData?.flowCurve}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors font-mono text-xs"
                        >
                          {tokenData?.flowCurve?.slice(0, 6)}...{tokenData?.flowCurve?.slice(-4)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={() => navigator.clipboard.writeText(tokenData?.flowCurve || '')}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <img src="/hedera-logo.png" alt="Hedera" className="w-3 h-3" />
                        <span className="text-gray-400">Hedera:</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://hashscan.io/mainnet/address/${tokenData?.hederaCurve}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors font-mono text-xs"
                        >
                          {tokenData?.hederaCurve?.slice(0, 6)}...{tokenData?.hederaCurve?.slice(-4)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={() => navigator.clipboard.writeText(tokenData?.hederaCurve || '')}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="border-t border-zinc-800 pt-4">
                  <p className="text-gray-300">
                    {tokenData?.description || "Cross-chain meme token powered by bonding curves. Trade seamlessly on Flow and Hedera."}
                  </p>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="relative">
              <PriceChart
                tokenSymbol="SILENTHILL"
                currentPrice={0.0145}
                change24h={3.81}
              />
              {/* Coming Soon Overlay */}
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">Chart Data Coming Soon</h3>
                  <p className="text-gray-400">Real-time price tracking will be available shortly</p>
                </div>
              </div>
            </div>

            {/* Comments Section - Commented out for now */}
            {/* <div className="bg-zinc-900 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4">Comments</h2>

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
            </div> */}
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
                  <span className="text-gray-400">{selectedChain.symbol} Balance:</span>
                  <span>{nativeBalance ? parseFloat(nativeBalance.formatted).toFixed(6) : '0.000000'} {selectedChain.symbol}</span>
                </div>
                {activeTab === "sell" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Token Balance:</span>
                    <span>{tokenBalance.toFixed(6)} {tokenData?.symbol}</span>
                  </div>
                )}
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-2 block">
                  {activeTab === "buy"
                    ? `Enter ${selectedChain.symbol} amount to spend`
                    : `Enter ${tokenData?.symbol || 'token'} amount to sell`}
                </label>
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
                          else if (preset === "Max") {
                            if (activeTab === "buy" && nativeBalance) {
                              const maxBuy = Math.max(0, parseFloat(nativeBalance.formatted) - 0.01);
                              setAmount(maxBuy.toString());
                            } else if (activeTab === "sell") {
                              setAmount(tokenBalance.toString());
                            }
                          }
                          else setAmount(preset);
                        }}
                        className="flex-1 py-1 text-xs bg-zinc-700 rounded hover:bg-zinc-600 transition-colors"
                      >
                        {preset} {preset !== "Reset" && preset !== "Max" && (activeTab === "sell" ? tokenData?.symbol : selectedChain.symbol)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quote Display */}
              {amount && parseFloat(amount) > 0 && (
                activeTab === "buy" && !tokenAmount ? (
                  // Loading skeleton
                  <div className="mb-4 p-3 bg-zinc-800 rounded-lg animate-pulse">
                    <div className="flex justify-between mb-2 pb-2 border-b border-zinc-700">
                      <div className="h-4 w-20 bg-zinc-700 rounded"></div>
                      <div className="h-5 w-32 bg-zinc-700 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <div className="h-3 w-24 bg-zinc-700 rounded"></div>
                        <div className="h-3 w-20 bg-zinc-700 rounded"></div>
                      </div>
                      <div className="flex justify-between">
                        <div className="h-3 w-28 bg-zinc-700 rounded"></div>
                        <div className="h-3 w-24 bg-zinc-700 rounded"></div>
                      </div>
                    </div>
                  </div>
                ) : quote && (
                  <div className="mb-4 p-3 bg-zinc-800 rounded-lg">
                    {activeTab === "buy" && tokenAmount && (
                      <div className="flex justify-between text-sm mb-2 pb-2 border-b border-zinc-700">
                        <span className="text-gray-400">You'll Receive:</span>
                        <span className="font-bold text-green-400 text-lg">
                          {Math.floor(parseFloat(tokenAmount)).toLocaleString()} {tokenData?.symbol}
                        </span>
                      </div>
                    )}
                    {activeTab === "sell" && (
                      <div className="flex justify-between text-sm mb-2 pb-2 border-b border-zinc-700">
                        <span className="text-gray-400">You'll Receive:</span>
                        <span className="font-bold text-green-400 text-lg">
                          {parseFloat(quote.cost).toFixed(6)} {selectedChain.symbol}
                        </span>
                      </div>
                    )}
                    {(quote.protocolFee || quote.creatorFee) && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Platform Fees:</span>
                        <span className="text-yellow-400">
                          {(parseFloat(quote.protocolFee || '0') + parseFloat(quote.creatorFee || '0')).toFixed(6)} {selectedChain.symbol}
                        </span>
                      </div>
                    )}
                    <div className="mt-2 pt-2 border-t border-zinc-700 text-xs text-gray-500">
                      <div className="flex justify-between">
                        <span>Protocol Fee (1%):</span>
                        <span>{parseFloat(quote.protocolFee || '0').toFixed(6)} {selectedChain.symbol}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Creator Fee (1%):</span>
                        <span>{parseFloat(quote.creatorFee || '0').toFixed(6)} {selectedChain.symbol}</span>
                      </div>
                    </div>
                    {quote.price && parseFloat(quote.price) > 0 && (
                      <div className="flex justify-between text-sm mt-2 pt-2 border-t border-zinc-700">
                        <span className="text-gray-400">Avg Price per Token:</span>
                        <span>{parseFloat(quote.price).toFixed(8)} {selectedChain.symbol}</span>
                      </div>
                    )}
                  </div>
                )
              )}

              {/* Trade Button */}
              <Button
                onClick={async () => {
                  if (!amount || !address || !isConnected) {
                    alert("Please connect your wallet first!");
                    return;
                  }


                  const txAmount = activeTab === "buy"
                    ? (tokenAmount ? Math.floor(parseFloat(tokenAmount)).toString() : "0")
                    : amount;

                  const txTokenSymbol = tokenData?.symbol || 'TOKEN';

                  // Show processing modal
                  setTxModal({
                    isOpen: true,
                    status: 'processing',
                    action: activeTab === 'buy' ? 'Buy' : 'Sell',
                    amount: txAmount,
                    token: txTokenSymbol
                  });

                  setIsTrading(true);
                  try {
                    let receipt;
                    if (activeTab === "buy") {
                      // Use tokenAmount for buy (calculated from FLOW/HBAR spend)
                      if (!tokenAmount) {
                        setTxModal({
                          isOpen: true,
                          status: 'error',
                          error: "Calculating token amount, please wait...",
                          action: 'Buy',
                          amount: txAmount,
                          token: txTokenSymbol
                        });
                        setIsTrading(false);
                        return;
                      }
                      receipt = await bondingCurve.buy(tokenAmount);
                    } else {
                      receipt = await bondingCurve.sell(amount);
                    }

                    // Show success modal
                    setTxModal({
                      isOpen: true,
                      status: 'success',
                      txHash: receipt.transactionHash || receipt.hash,
                      action: activeTab === 'buy' ? 'Buy' : 'Sell',
                      amount: txAmount,
                      token: txTokenSymbol
                    });

                    setAmount("");
                    setTokenAmount("");
                    setQuote(null);

                    // Refresh balances after successful transaction
                    setTimeout(() => {
                      setBalanceKey(prev => prev + 1); // Trigger balance refresh
                      refetchBalance(); // Immediate refetch
                    }, 1000);

                    // Sync in background
                    fetch('/api/sync', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        tokenId: params.id,
                        chain: selectedChain.id,
                        txHash: receipt.transactionHash || receipt.hash,
                        type: activeTab,
                        amount: txAmount,
                        user: address
                      })
                    }).catch(() => {});

                  } catch (error: any) {
                    setTxModal({
                      isOpen: true,
                      status: 'error',
                      error: error.message || 'Transaction failed. Please try again.',
                      action: activeTab === 'buy' ? 'Buy' : 'Sell',
                      amount: txAmount,
                      token: txTokenSymbol
                    });
                  }
                  setIsTrading(false);
                }}
                disabled={isTrading || !amount || !address || parseFloat(amount) <= 0}
                className={`w-full py-6 text-lg font-bold ${
                  activeTab === "buy"
                    ? "bg-green-500 hover:bg-green-600 text-black disabled:bg-green-900"
                    : "bg-red-500 hover:bg-red-600 text-white disabled:bg-red-900"
                }`}
              >
                {!isConnected ? "Connect Wallet" :
                 isTrading ? "Processing..." :
                 !amount ? `Enter Amount` :
                 activeTab === "buy" ?
                   (tokenAmount ? `Buy ${Math.floor(parseFloat(tokenAmount)).toLocaleString()} ${tokenData?.symbol || 'TOKEN'}` : "Calculating...") :
                   `Sell ${parseFloat(amount).toLocaleString()} ${tokenData?.symbol || 'TOKEN'}`}
              </Button>

              {/* Bonding Curve Progress */}
              <div className="mt-6 pt-6 border-t border-zinc-800">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400 font-semibold">Bonding Curve</span>
                  <span className="text-xs text-gray-500">
                    {((bondingCurve.supply + otherChainSupply) / (1000000 * 0.9) * 100).toFixed(1)}% filled
                  </span>
                </div>

                <div className="relative w-full h-4 bg-zinc-700 rounded-full overflow-hidden mb-3">
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (bondingCurve.supply + otherChainSupply) / (1000000 * 0.9) * 100)}%`
                    }}
                  />
                  <div className="absolute left-0 top-0 h-full w-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white/80 drop-shadow-md">
                      {Math.floor(bondingCurve.supply + otherChainSupply).toLocaleString()} / {(900000).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-zinc-700/30 rounded p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <img src="/flow-logo.png" alt="Flow" className="w-3 h-3" />
                      <span className="text-gray-400">Flow Supply</span>
                    </div>
                    <div className="font-semibold">
                      {selectedChain.id === 'flow' ? bondingCurve.supply.toLocaleString() : otherChainSupply.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-zinc-700/30 rounded p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <img src="/hedera-logo.png" alt="Hedera" className="w-3 h-3" />
                      <span className="text-gray-400">Hedera Supply</span>
                    </div>
                    <div className="font-semibold">
                      {selectedChain.id === 'hedera' ? bondingCurve.supply.toLocaleString() : otherChainSupply.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-500 text-center">
                  <span>Graduation at 90% of max supply • </span>
                  <span>Current Price: {bondingCurve.currentPrice.toFixed(8)} {selectedChain.symbol}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={txModal.isOpen}
        onClose={() => setTxModal({ ...txModal, isOpen: false })}
        status={txModal.status}
        txHash={txModal.txHash}
        error={txModal.error}
        action={txModal.action}
        amount={txModal.amount}
        token={txModal.token}
        chain={selectedChain.id}
      />
    </div>
  );
}