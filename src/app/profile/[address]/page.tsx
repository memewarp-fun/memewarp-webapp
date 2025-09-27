"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Copy, ExternalLink, Trophy, Coins, Rocket, Calendar, TrendingUp } from "lucide-react";
import { useParams } from "next/navigation";

interface UserToken {
  id: string;
  name: string;
  symbol: string;
  launchDate: string;
  marketCap: number;
  chain: "flow" | "hedera";
  isLive: boolean;
}

const mockUserTokens: UserToken[] = [
  {
    id: "1",
    name: "Doge Killer",
    symbol: "DOGEKILL",
    launchDate: "2025-09-25",
    marketCap: 45000,
    chain: "flow",
    isLive: true
  },
  {
    id: "2",
    name: "Moon Cat",
    symbol: "MCAT",
    launchDate: "2025-09-24",
    marketCap: 38900,
    chain: "hedera",
    isLive: true
  },
  {
    id: "3",
    name: "Rocket Pepe",
    symbol: "RPEPE",
    launchDate: "2025-09-20",
    marketCap: 12300,
    chain: "flow",
    isLive: false
  }
];

export default function ProfilePage() {
  const params = useParams();
  const address = params.address as string;
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const activeTokens = mockUserTokens.filter(t => t.isLive);
  const totalMarketCap = mockUserTokens.reduce((acc, t) => acc + t.marketCap, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold font-space-grotesk mb-2">User Profile</h1>
                <div className="flex items-center gap-2">
                  <span className="text-lg text-muted-foreground">{truncateAddress(address)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyAddress}
                    className="h-auto p-1"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  {copied && (
                    <span className="text-sm text-green-500">Copied!</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  FlowScan
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  HashScan
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Rocket className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tokens Launched</p>
                    <p className="text-2xl font-bold">{mockUserTokens.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Tokens</p>
                    <p className="text-2xl font-bold">{activeTokens.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Coins className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Market Cap</p>
                    <p className="text-2xl font-bold">${(totalMarketCap / 1000).toFixed(1)}K</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">{((activeTokens.length / mockUserTokens.length) * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Launched Tokens */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Launched Tokens</h2>
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-4 font-medium">Token</th>
                        <th className="text-left p-4 font-medium">Chain</th>
                        <th className="text-left p-4 font-medium">Launch Date</th>
                        <th className="text-right p-4 font-medium">Market Cap</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-right p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockUserTokens.map((token) => (
                        <tr key={token.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-500 rounded-full" />
                              <div>
                                <p className="font-semibold">{token.name}</p>
                                <p className="text-sm text-muted-foreground">{token.symbol}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="gap-1">
                              <img
                                src={token.chain === "flow" ? "/flow-logo.png" : "/hedera-logo.png"}
                                alt={token.chain}
                                className="w-3 h-3"
                              />
                              {token.chain === "flow" ? "Flow" : "Hedera"}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              {new Date(token.launchDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="text-right p-4 font-semibold">
                            ${(token.marketCap / 1000).toFixed(1)}K
                          </td>
                          <td className="p-4">
                            {token.isLive ? (
                              <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                                Live
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                Ended
                              </Badge>
                            )}
                          </td>
                          <td className="text-right p-4">
                            <Button size="sm" variant="outline">View</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="font-medium">Launched DOGEKILL on Flow</p>
                      <p className="text-sm text-muted-foreground">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="font-medium">Created liquidity pool for MCAT</p>
                      <p className="text-sm text-muted-foreground">3 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="font-medium">Started streaming for RPEPE launch</p>
                      <p className="text-sm text-muted-foreground">7 days ago</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}