"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Rocket, AlertCircle, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useTokenFactory } from "@/hooks/useTokenFactory";

export default function CreateTokenPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const flowFactory = useTokenFactory('flow');
  const hederaFactory = useTokenFactory('hedera');
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    description: "",
    image: null as File | null,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const imageUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=${formData.symbol}`;

      const [flowResult, hederaResult] = await Promise.all([
        flowFactory.createToken({
          name: formData.name,
          symbol: formData.symbol,
          description: formData.description,
          imageUrl,
          maxSupply: "1000000"
        }),
        hederaFactory.createToken({
          name: formData.name,
          symbol: formData.symbol,
          description: formData.description,
          imageUrl,
          maxSupply: "1000000"
        })
      ]);

      await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: formData.symbol,
          name: formData.name,
          description: formData.description,
          imageUrl,
          creator: address,
          flowAddress: flowResult.tokenAddress,
          hederaAddress: hederaResult.tokenAddress,
          flowCurve: flowResult.bondingCurve,
          hederaCurve: hederaResult.bondingCurve
        })
      });

      router.push(`/token/${formData.symbol}`);
    } catch (error) {
      console.error('Token creation failed:', error);
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold font-space-grotesk mb-2">Launch Your Meme Token</h1>
              <p className="text-muted-foreground">Deploy simultaneously on Flow & Hedera</p>
            </div>

            {!isConnected ? (
              <Card className="p-12 text-center">
                <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
                <p className="text-muted-foreground mb-6">
                  You need to connect your wallet to create a token
                </p>
                <div className="flex justify-center">
                  <ConnectButton />
                </div>
              </Card>
            ) : (
              <>
                <Card className="p-4 bg-green-500/5 border-green-500/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="text-green-500 font-semibold">Dual Chain Launch</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        Deploys on both chains. Cross-chain liquidity included.
                      </p>
                    </div>
                  </div>
                </Card>

                <form onSubmit={handleSubmit}>
              <Card className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Token Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Doge Killer"
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Token Symbol *</label>
                      <input
                        type="text"
                        required
                        placeholder="DOGEKILL"
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
                        value={formData.symbol}
                        onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        placeholder="Tell the world why your meme token will moon..."
                        rows={4}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Token Image</label>
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {formData.image ? formData.image.name : "Upload meme image"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Card className="p-4 bg-blue-500/5 border-blue-500/20">
                        <img src="/flow-logo.png" alt="Flow" className="w-8 h-8 mb-2" />
                        <p className="text-sm font-medium">Flow</p>
                        <p className="text-xs text-muted-foreground">50% supply</p>
                      </Card>
                      <Card className="p-4 bg-purple-500/5 border-purple-500/20">
                        <img src="/hedera-logo.png" alt="Hedera" className="w-8 h-8 mb-2" />
                        <p className="text-sm font-medium">Hedera</p>
                        <p className="text-xs text-muted-foreground">50% supply</p>
                      </Card>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-lg py-6 mt-6"
                  disabled={isCreating || !formData.name || !formData.symbol}
                >
                  {isCreating ? (
                    <>Creating on both chains...</>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5 mr-2" />
                      Launch Token on Flow & Hedera
                    </>
                  )}
                </Button>
              </Card>
            </form>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}