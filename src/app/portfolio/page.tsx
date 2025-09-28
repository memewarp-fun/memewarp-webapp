"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Wallet, Coins, ArrowLeftRight } from "lucide-react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useBondingCurve } from "@/hooks/useBondingCurve";
import { TransferModal } from "@/components/transfer-modal";
import { PortfolioTokenRow } from "@/components/portfolio-token-row";
import { CrossChainModal } from "@/components/cross-chain-modal";
import React from "react";

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

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const [selectedChain, setSelectedChain] = useState<"all" | "flow" | "hedera">("all");
  const [isTransferring, setIsTransferring] = useState<{[key: string]: boolean}>({});
  const [transferModal, setTransferModal] = useState<{
    isOpen: boolean;
    holding: TokenHolding | null;
  }>({ isOpen: false, holding: null });
  const [crossChainModal, setCrossChainModal] = useState<{
    isOpen: boolean;
    status: "burning" | "minting" | "success" | "error";
    burnTxHash?: string;
    mintTxHash?: string;
    error?: string;
    amount?: string;
    token?: string;
    sourceChain?: string;
    targetChain?: string;
  }>({ isOpen: false, status: "burning" });
  const [tokens, setTokens] = useState<any[]>([]);
  const [userBalances, setUserBalances] = useState<{[key: string]: {flow: number, hedera: number, value: number}}>({});
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    fetch('/api/tokens')
      .then(res => res.json())
      .then(data => setTokens(data))
      .catch(console.error);
  }, []);

  // Calculate user-specific stats
  const tokensWithBalance = Object.keys(userBalances).filter(id => {
    const balance = userBalances[id];
    return (balance.flow + balance.hedera) > 0;
  });

  const flowTokens = tokensWithBalance.filter(id => userBalances[id].flow > 0);
  const hederaTokens = tokensWithBalance.filter(id => userBalances[id].hedera > 0);

  const handleBalanceUpdate = (tokenId: string, flowBalance: number, hederaBalance: number, value: number) => {
    setUserBalances(prev => ({
      ...prev,
      [tokenId]: { flow: flowBalance, hedera: hederaBalance, value }
    }));
  };

  // Calculate total portfolio value
  React.useEffect(() => {
    const total = Object.values(userBalances).reduce((sum, balance) => {
      return sum + (balance.value || 0);
    }, 0);
    setTotalValue(total);
  }, [userBalances]);

  const filteredTokens = tokens.filter(token => {
    const balance = userBalances[token.id];
    if (!balance) return true; // Show all tokens initially, PortfolioTokenRow will filter by balance

    if (selectedChain === "all") {
      return true;
    } else if (selectedChain === "flow") {
      return balance.flow > 0;
    } else if (selectedChain === "hedera") {
      return balance.hedera > 0;
    }
    return false;
  });


  const handleCrossChainTransfer = async (amount: string) => {
    const holding = transferModal.holding;
    if (!holding || !amount || !address) return;

    setIsTransferring({ ...isTransferring, [holding.id]: true });
    setTransferModal({ isOpen: false, holding: null });

    const targetChain = holding.chain === 'flow' ? 'hedera' : 'flow';

    const token = tokens.find(t => t.id === holding.id);
    const curveAddress = token?.[`${holding.chain}Curve`];
    const targetCurveAddress = token?.[`${targetChain}Curve`];

    if (!curveAddress) {
      alert('Cannot find bonding curve address for this token');
      setIsTransferring({ ...isTransferring, [holding.id]: false });
      return;
    }

    setCrossChainModal({
      isOpen: true,
      status: "burning",
      amount,
      token: holding.symbol,
      sourceChain: holding.chain,
      targetChain
    });

    try {
      const response = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: holding.chain,
          to: targetChain,
          amount,
          tokenSymbol: holding.symbol,
          userAddress: address,
          curveAddress,
          targetCurveAddress,
          tokenId: holding.id
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Transfer failed');
      }

      if (result.burnTxHash) {
        setCrossChainModal(prev => ({
          ...prev,
          status: "minting",
          burnTxHash: result.burnTxHash
        }));
      }

      if (result.mintTxHash) {
        setCrossChainModal(prev => ({
          ...prev,
          status: "success",
          mintTxHash: result.mintTxHash
        }));
      } else if (result.status === 'burn-complete') {
        setCrossChainModal(prev => ({
          ...prev,
          status: "success",
          burnTxHash: result.burnTxHash
        }));
      }

      await fetch('/api/sync', { method: 'POST' });

    } catch (error: any) {
      console.error('Transfer failed:', error);
      setCrossChainModal(prev => ({
        ...prev,
        status: "error",
        error: error.message || 'Transfer failed. Please try again.'
      }));
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
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <span className="text-green-500 text-xl font-bold">$</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Portfolio Value</p>
                      <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Coins className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Your Tokens</p>
                      <p className="text-2xl font-bold">{tokensWithBalance.length}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <img src="/flow-logo.png" alt="Flow" className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Flow Holdings</p>
                      <p className="text-2xl font-bold">{flowTokens.length}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <img src="/hedera-logo.png" alt="Hedera" className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Hedera Holdings</p>
                      <p className="text-2xl font-bold">{hederaTokens.length}</p>
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

              {/* Token Holdings */}
              {filteredTokens.length > 0 ? (
                  <Card>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b">
                          <tr>
                            <th className="text-left p-4 font-medium">Token</th>
                            <th className="text-left p-4 font-medium">Chains</th>
                            <th className="text-right p-4 font-medium">Flow Balance</th>
                            <th className="text-right p-4 font-medium">Hedera Balance</th>
                            <th className="text-right p-4 font-medium">Total Balance</th>
                            <th className="text-right p-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTokens.map((token) => (
                            <PortfolioTokenRow
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
                                    price: 0,
                                    value: 0,
                                    change24h: 0,
                                    chain
                                  }
                                });
                              }}
                              isTransferring={isTransferring[token.id] || false}
                              onBalanceUpdate={handleBalanceUpdate}
                              selectedChain={selectedChain}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No tokens found in your portfolio</p>
                </Card>
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

      <CrossChainModal
        isOpen={crossChainModal.isOpen}
        onClose={() => setCrossChainModal({ ...crossChainModal, isOpen: false })}
        status={crossChainModal.status}
        burnTxHash={crossChainModal.burnTxHash}
        mintTxHash={crossChainModal.mintTxHash}
        error={crossChainModal.error}
        amount={crossChainModal.amount}
        token={crossChainModal.token}
        sourceChain={crossChainModal.sourceChain}
        targetChain={crossChainModal.targetChain}
      />
    </div>
  );
}