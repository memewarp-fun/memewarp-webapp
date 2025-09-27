"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useBondingCurve } from "@/hooks/useBondingCurve";
import { useAccount } from "wagmi";

export function CrossChainTransfer({ 
  tokenData,
  sourceChain,
  targetChain 
}: {
  tokenData: any;
  sourceChain: 'flow' | 'hedera';
  targetChain: 'flow' | 'hedera';
}) {
  const { address } = useAccount();
  const [amount, setAmount] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  const bondingCurve = useBondingCurve(
    tokenData?.[`${sourceChain}Curve`],
    sourceChain
  );

  const handleTransfer = async () => {
    if (!amount || !address) return;
    
    setIsTransferring(true);
    try {
      const result = await bondingCurve.burnForCrossChain(amount, targetChain);
      
      await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: sourceChain,
          to: targetChain,
          amount,
          burnTx: result.transactionHash,
          tokenSymbol: tokenData.symbol
        })
      });

      setAmount("");
      await fetch('/api/sync', { method: 'POST' });
    } catch (error) {
      console.error('Transfer failed:', error);
    }
    setIsTransferring(false);
  };

  const chainNames = {
    flow: "Flow",
    hedera: "Hedera"
  };

  return (
    <Card className="p-6 bg-zinc-900 border-zinc-800">
      <h3 className="text-lg font-bold mb-4">Cross-Chain Transfer</h3>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 text-center">
          <p className="text-sm text-gray-400">From</p>
          <p className="font-bold">{chainNames[sourceChain]}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-green-500" />
        <div className="flex-1 text-center">
          <p className="text-sm text-gray-400">To</p>
          <p className="font-bold">{chainNames[targetChain]}</p>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Amount to transfer"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <Button
        onClick={handleTransfer}
        disabled={isTransferring || !amount || !address}
        className="w-full bg-green-500 hover:bg-green-600 text-black font-bold"
      >
        {isTransferring ? "Processing Transfer..." : "Transfer Tokens"}
      </Button>

      <p className="text-xs text-gray-500 mt-4">
        Transfers take 2-5 minutes to complete. Tokens are burned on source chain and minted on target chain.
      </p>
    </Card>
  );
}