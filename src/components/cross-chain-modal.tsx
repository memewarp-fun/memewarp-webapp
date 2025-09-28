"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, ArrowRight, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CrossChainModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: "burning" | "minting" | "success" | "error";
  burnTxHash?: string;
  mintTxHash?: string;
  error?: string;
  amount?: string;
  token?: string;
  sourceChain?: string;
  targetChain?: string;
}

export function CrossChainModal({
  isOpen,
  onClose,
  status,
  burnTxHash,
  mintTxHash,
  error,
  amount,
  token,
  sourceChain,
  targetChain
}: CrossChainModalProps) {
  const getExplorerUrl = (txHash: string, chain: string) => {
    if (chain === 'flow') {
      return `https://evm.flowscan.io/tx/${txHash}`;
    } else if (chain === 'hedera') {
      return `https://hashscan.io/mainnet/transaction/${txHash}`;
    }
    return '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cross-Chain Transfer</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {amount && token && (
            <div className="text-center mb-4">
              <p className="text-2xl font-bold">{amount} {token}</p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-2">
                <span className="capitalize">{sourceChain}</span>
                <ArrowRight className="w-4 h-4" />
                <span className="capitalize">{targetChain}</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className={`flex items-center gap-3 p-3 rounded-lg ${
              status === "burning" ? "bg-orange-500/10 border border-orange-500/20" :
              burnTxHash ? "bg-green-500/10 border border-green-500/20" :
              "bg-muted"
            }`}>
              <div>
                {status === "burning" ? (
                  <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                ) : burnTxHash ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/20" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">Burning on {sourceChain}</p>
                {burnTxHash && (
                  <a
                    href={getExplorerUrl(burnTxHash, sourceChain || '')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                  >
                    View transaction <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-lg ${
              status === "minting" ? "bg-blue-500/10 border border-blue-500/20" :
              mintTxHash ? "bg-green-500/10 border border-green-500/20" :
              "bg-muted"
            }`}>
              <div>
                {status === "minting" ? (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                ) : mintTxHash ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/20" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">Minting on {targetChain}</p>
                {mintTxHash && (
                  <a
                    href={getExplorerUrl(mintTxHash, targetChain || '')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                  >
                    View transaction <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {status === "success" && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="font-bold text-green-500">Transfer Complete!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your tokens have been successfully transferred from {sourceChain} to {targetChain}
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <p className="font-bold text-red-500">Transfer Failed</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {error || "An error occurred during the transfer"}
              </p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              onClick={onClose}
              variant={status === "success" ? "default" : "outline"}
            >
              {status === "burning" || status === "minting" ? "Close" : "Done"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}