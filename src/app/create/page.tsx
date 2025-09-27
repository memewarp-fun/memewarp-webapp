"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Rocket, AlertCircle, Wallet, Check, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function CreateTokenPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [isCreating, setIsCreating] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<string>("");
  const [deploymentSteps, setDeploymentSteps] = useState<any[]>([]);
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

    if (!address) {
      alert("Please connect your wallet first!");
      return;
    }

    setIsCreating(true);
    setDeploymentStatus("Initializing...");
    setDeploymentSteps([]);

    try {
      const imageUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=${formData.symbol}`;

      console.log('Creating token with creator address:', address);

      const response = await fetch('/api/tokens/create-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          symbol: formData.symbol,
          description: formData.description,
          imageUrl,
          creator: address
        })
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

          for (const line of lines) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.status === 'completed') {
                setDeploymentStatus("Success! Redirecting...");
                setDeploymentSteps(prev => [...prev, {
                  message: "Token creation completed!",
                  status: 'completed',
                  token: data.token
                }]);
                setTimeout(() => {
                  router.push(`/token/${formData.symbol}`);
                }, 2000);
              } else if (data.status === 'error') {
                setDeploymentSteps(prev => [...prev, {
                  message: data.message,
                  status: 'error'
                }]);
                throw new Error(data.message);
              } else {
                setDeploymentStatus(data.message);

                if (data.status === 'validating') {
                  setDeploymentSteps([{ message: "Validating token parameters", status: 'completed' }]);
                } else if (data.status === 'connecting') {
                  setDeploymentSteps(prev => [...prev, { message: "Connecting to blockchains", status: 'completed' }]);
                } else if (data.status === 'deploying_flow') {
                  setDeploymentSteps(prev => [...prev, { message: "Deploying on Flow blockchain", status: 'pending' }]);
                } else if (data.status === 'confirming_flow' && data.flowTx) {
                  setDeploymentSteps(prev => {
                    const updated = [...prev];
                    const flowIndex = updated.findIndex(s => s.message === "Deploying on Flow blockchain");
                    if (flowIndex >= 0) {
                      updated[flowIndex] = {
                        message: "Flow deployment confirmed",
                        status: 'completed',
                        txHash: data.flowTx,
                        chain: 'flow'
                      };
                    }
                    return updated;
                  });
                } else if (data.status === 'deploying_hedera') {
                  setDeploymentSteps(prev => [...prev, { message: "Deploying on Hedera blockchain", status: 'pending' }]);
                } else if (data.status === 'confirming_hedera' && data.hederaTx) {
                  setDeploymentSteps(prev => {
                    const updated = [...prev];
                    const hederaIndex = updated.findIndex(s => s.message === "Deploying on Hedera blockchain");
                    if (hederaIndex >= 0) {
                      updated[hederaIndex] = {
                        message: "Hedera deployment confirmed",
                        status: 'completed',
                        txHash: data.hederaTx,
                        chain: 'hedera'
                      };
                    }
                    return updated;
                  });
                } else if (data.status === 'storing') {
                  setDeploymentSteps(prev => [...prev, { message: "Storing token data", status: 'completed' }]);
                }
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Token creation failed:', error);
      setDeploymentStatus(`Error: ${error.message}`);
      setTimeout(() => {
        setIsCreating(false);
        setDeploymentStatus("");
      }, 3000);
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

                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-lg py-6 mt-6"
                  disabled={isCreating || !formData.name || !formData.symbol}
                >
                  {isCreating ? (
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        <span>Deploying...</span>
                      </div>
                      {deploymentStatus && (
                        <span className="text-sm opacity-80">{deploymentStatus}</span>
                      )}
                    </div>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5 mr-2" />
                      Launch Token on Flow & Hedera
                    </>
                  )}
                </Button>
              </Card>
            </form>

            {isCreating && deploymentSteps.length > 0 && (
              <Card className="p-6 bg-zinc-900/50 border-zinc-800">
                <h3 className="text-lg font-semibold mb-4">Deployment Progress</h3>
                <div className="space-y-3">
                  {deploymentSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      {step.status === 'completed' ? (
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-black" />
                        </div>
                      ) : step.status === 'error' ? (
                        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <AlertCircle className="w-3 h-3 text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-zinc-600 flex-shrink-0 mt-0.5 animate-pulse" />
                      )}

                      <div className="flex-1">
                        <p className={`text-sm ${
                          step.status === 'completed' ? 'text-green-500' :
                          step.status === 'error' ? 'text-red-500' :
                          'text-zinc-400'
                        }`}>
                          {step.message}
                        </p>

                        {step.txHash && (
                          <div className="mt-1 flex items-center gap-2">
                            <a
                              href={
                                step.chain === 'flow'
                                  ? `https://evm.flowscan.io/tx/${step.txHash}`
                                  : `https://hashscan.io/mainnet/transaction/${step.txHash}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1"
                            >
                              View transaction <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        {step.token && (
                          <div className="mt-2 grid grid-cols-2 gap-4 p-3 bg-zinc-800/50 rounded-lg">
                            {step.token.flowAddress && (
                              <div>
                                <p className="text-xs text-zinc-500 mb-1">Flow Contract</p>
                                <a
                                  href={`https://evm.flowscan.io/address/${step.token.flowAddress}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1"
                                >
                                  {step.token.flowAddress.slice(0, 6)}...{step.token.flowAddress.slice(-4)}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                            {step.token.hederaAddress && (
                              <div>
                                <p className="text-xs text-zinc-500 mb-1">Hedera Contract</p>
                                <a
                                  href={`https://hashscan.io/mainnet/contract/${step.token.hederaAddress}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1"
                                >
                                  {step.token.hederaAddress.slice(0, 6)}...{step.token.hederaAddress.slice(-4)}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                            {step.token.flowCurve && (
                              <div>
                                <p className="text-xs text-zinc-500 mb-1">Flow Bonding Curve</p>
                                <a
                                  href={`https://evm.flowscan.io/address/${step.token.flowCurve}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1"
                                >
                                  {step.token.flowCurve.slice(0, 6)}...{step.token.flowCurve.slice(-4)}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                            {step.token.hederaCurve && (
                              <div>
                                <p className="text-xs text-zinc-500 mb-1">Hedera Bonding Curve</p>
                                <a
                                  href={`https://hashscan.io/mainnet/contract/${step.token.hederaCurve}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1"
                                >
                                  {step.token.hederaCurve.slice(0, 6)}...{step.token.hederaCurve.slice(-4)}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}