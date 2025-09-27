"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { TrendingUp, TrendingDown, Wallet, Coins, DollarSign, ArrowUpRight, ArrowDownRight, ArrowLeftRight } from "lucide-react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useBondingCurve } from "@/hooks/useBondingCurve";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { TransferModal } from "@/components/transfer-modal";
import { TokenRow } from "@/components/token-row";

interface TokenHolding {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  price: number;
  value: number;
  change24h: number;
  chain: "flow" | "hedera";
}

const mockHoldings: TokenHolding[] = [
  {
    id: "1",
    name: "Doge Killer",
    symbol: "DOGEKILL",
    balance: 1000000,
    price: 0.00045,
    value: 450,
    change24h: 125.5,
    chain: "flow"
  },
  {
    id: "2",
    name: "Moon Cat",
    symbol: "MCAT",
    balance: 500000,
    price: 0.00089,
    value: 445,
    change24h: -12.3,
    chain: "hedera"
  },
  {
    id: "3",
    name: "Pepe Classic",
    symbol: "PEPEC",
    balance: 2500000,
    price: 0.00012,
    value: 300,
    change24h: 45.7,
    chain: "flow"
  },
  {
    id: "4",
    name: "Shiba Dad",
    symbol: "SDAD",
    balance: 750000,
    price: 0.00067,
    value: 502.5,
    change24h: 8.9,
    chain: "hedera"
  }
];

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const [selectedChain, setSelectedChain] = useState<"all" | "flow" | "hedera">("all");
  const [isTransferring, setIsTransferring] = useState<{[key: string]: boolean}>({});
  const [transferModal, setTransferModal] = useState<{
    isOpen: boolean;
    holding: TokenHolding | null;
  }>({ isOpen: false, holding: null });
  const [tokens, setTokens] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/tokens')
      .then(res => res.json())
      .then(data => setTokens(data))
      .catch(console.error);
  }, []);

  const filteredHoldings = selectedChain === "all"
    ? mockHoldings
    : mockHoldings.filter(h => h.chain === selectedChain);

  const totalValue = filteredHoldings.reduce((acc, h) => acc + h.value, 0);
  const totalChange = filteredHoldings.reduce((acc, h) => acc + (h.value * h.change24h / 100), 0);
  const totalChangePercent = (totalChange / totalValue) * 100;

  const handleCrossChainTransfer = async (amount: string) => {
    const holding = transferModal.holding;
    if (!holding || !amount || !address) return;

    setIsTransferring({ ...isTransferring, [holding.id]: true });
    setTransferModal({ isOpen: false, holding: null });

    const targetChain = holding.chain === 'flow' ? 'hedera' : 'flow';

    const bondingCurve = useBondingCurve(
      holding.chain === 'flow' ? '0x1234' : '0x5678',
      holding.chain
    );

    try {
      await bondingCurve.burnForCrossChain(amount, targetChain);

      await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: holding.chain,
          to: targetChain,
          amount,
          tokenSymbol: holding.symbol
        })
      });

      await fetch('/api/sync', { method: 'POST' });
    } catch (error) {
      console.error('Transfer failed:', error);
    }

    setIsTransferring({ ...isTransferring, [holding.id]: false });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-6 max-w-6xl">
          {!isConnected ? (
            <Card className="p-12 text-center">
              <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
              <p className="text-muted-foreground mb-6">
                View your meme token portfolio across Flow and Hedera
              </p>
              <div className="flex justify-center">
                <ConnectButton />
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold font-space-grotesk mb-2">Your Portfolio</h1>
                <p className="text-muted-foreground">Track your meme tokens across chains</p>
              </div>

              {/* Portfolio Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Value</p>
                      <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Coins className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Tokens</p>
                      <p className="text-2xl font-bold">{filteredHoldings.length}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Wallet className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Chains</p>
                      <p className="text-2xl font-bold">2</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Chain Filter */}
              <div className="flex gap-2">
                <Button
                  variant={selectedChain === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedChain("all")}
                >
                  All Chains
                </Button>
                <Button
                  variant={selectedChain === "flow" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedChain("flow")}
                  className="gap-2"
                >
                  <img src="/flow-logo.png" alt="Flow" className="w-4 h-4" />
                  Flow
                </Button>
                <Button
                  variant={selectedChain === "hedera" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedChain("hedera")}
                  className="gap-2"
                >
                  <img src="/hedera-logo.png" alt="Hedera" className="w-4 h-4" />
                  Hedera
                </Button>
              </div>

              {/* Holdings Table */}
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-4 font-medium">Token</th>
                        <th className="text-left p-4 font-medium">Chain</th>
                        <th className="text-right p-4 font-medium">Balance</th>
                        <th className="text-right p-4 font-medium">Price</th>
                        <th className="text-right p-4 font-medium">Value</th>
                        <th className="text-right p-4 font-medium">24h Change</th>
                        <th className="text-right p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHoldings.map((holding) => (
                        <tr key={holding.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-500 rounded-full" />
                              <div>
                                <p className="font-semibold">{holding.name}</p>
                                <p className="text-sm text-muted-foreground">{holding.symbol}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="gap-1">
                              <img
                                src={holding.chain === "flow" ? "/flow-logo.png" : "/hedera-logo.png"}
                                alt={holding.chain}
                                className="w-3 h-3"
                              />
                              {holding.chain === "flow" ? "Flow" : "Hedera"}
                            </Badge>
                          </td>
                          <td className="text-right p-4">
                            {holding.balance.toLocaleString()}
                          </td>
                          <td className="text-right p-4">
                            ${holding.price.toFixed(6)}
                          </td>
                          <td className="text-right p-4 font-semibold">
                            ${holding.value.toFixed(2)}
                          </td>
                          <td className="text-right p-4">
                            <div className={`flex items-center justify-end gap-1 ${holding.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {holding.change24h >= 0 ? (
                                <ArrowUpRight className="w-4 h-4" />
                              ) : (
                                <ArrowDownRight className="w-4 h-4" />
                              )}
                              {Math.abs(holding.change24h)}%
                            </div>
                          </td>
                          <td className="text-right p-4">
                            <div className="flex gap-2 justify-end">
                              <Button size="sm" variant="outline">Trade</Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setTransferModal({ isOpen: true, holding })}
                                disabled={isTransferring[holding.id]}
                                className="gap-1"
                              >
                                <ArrowLeftRight className="w-3 h-3" />
                                Move to {holding.chain === "flow" ? "Hedera" : "Flow"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {tokens.length > 0 && (
                <>
                  <h2 className="text-xl font-bold mt-8 mb-4">On-Chain Balances</h2>
                  <Card>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b">
                          <tr>
                            <th className="text-left p-4 font-medium">Token</th>
                            <th className="text-left p-4 font-medium">Chains</th>
                            <th className="text-right p-4 font-medium">Balance</th>
                            <th className="text-right p-4 font-medium">Price</th>
                            <th className="text-right p-4 font-medium">Value</th>
                            <th className="text-right p-4 font-medium">24h Change</th>
                            <th className="text-right p-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tokens.map((token) => (
                            <TokenRow
                              key={token.id}
                              token={token}
                              userAddress={address}
                              onTransfer={(tokenData, chain) => {
                                setTransferModal({
                                  isOpen: true,
                                  holding: {
                                    ...tokenData,
                                    id: token.id,
                                    name: token.name,
                                    symbol: token.symbol,
                                    balance: tokenData.balance,
                                    price: token.priceUSD,
                                    value: tokenData.balance * token.priceUSD,
                                    change24h: 0,
                                    chain
                                  }
                                });
                              }}
                              isTransferring={isTransferring[token.id] || false}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {transferModal.holding && (
        <TransferModal
          isOpen={transferModal.isOpen}
          onClose={() => setTransferModal({ isOpen: false, holding: null })}
          onConfirm={handleCrossChainTransfer}
          tokenSymbol={transferModal.holding.symbol}
          sourceChain={transferModal.holding.chain === "flow" ? "Flow" : "Hedera"}
          targetChain={transferModal.holding.chain === "flow" ? "Hedera" : "Flow"}
          balance={transferModal.holding.balance}
        />
      )}
    </div>
  );
}