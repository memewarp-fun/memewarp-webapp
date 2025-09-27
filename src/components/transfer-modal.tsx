"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight } from "lucide-react";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: string) => void;
  tokenSymbol: string;
  sourceChain: string;
  targetChain: string;
  balance: number;
}

export function TransferModal({
  isOpen,
  onClose,
  onConfirm,
  tokenSymbol,
  sourceChain,
  targetChain,
  balance
}: TransferModalProps) {
  const [amount, setAmount] = useState("");

  const handleConfirm = () => {
    if (amount && parseFloat(amount) > 0) {
      onConfirm(amount);
      setAmount("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cross-Chain Transfer</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4 py-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">From</p>
              <p className="font-bold">{sourceChain}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-green-500" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">To</p>
              <p className="font-bold">{targetChain}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Amount of {tokenSymbol}</label>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
              max={balance}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Available: {balance.toLocaleString()} {tokenSymbol}
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setAmount(balance.toString())} size="sm" variant="outline">
              Max
            </Button>
            <Button onClick={() => setAmount((balance * 0.5).toString())} size="sm" variant="outline">
              50%
            </Button>
            <Button onClick={() => setAmount((balance * 0.25).toString())} size="sm" variant="outline">
              25%
            </Button>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance}
              className="flex-1 bg-green-500 hover:bg-green-600 text-black"
            >
              Transfer
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Transfer takes 2-5 minutes. Tokens are burned on {sourceChain} and minted on {targetChain}.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}