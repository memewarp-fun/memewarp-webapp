"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckCircle, Loader2, XCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'processing' | 'success' | 'error';
  txHash?: string;
  error?: string;
  action?: string;
  amount?: string;
  token?: string;
  chain?: string;
}

export function TransactionModal({
  isOpen,
  onClose,
  status,
  txHash,
  error,
  action = 'Transaction',
  amount,
  token,
  chain
}: TransactionModalProps) {
  const getExplorerUrl = () => {
    if (!txHash) return '';
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
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          {status === 'processing' && (
            <>
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <h3 className="text-xl font-semibold">Processing {action}</h3>
              {amount && token && (
                <p className="text-sm text-muted-foreground">
                  {action === 'Buy' ? 'Buying' : 'Selling'} {amount} {token}
                </p>
              )}
              <p className="text-xs text-muted-foreground text-center max-w-sm">
                Please confirm the transaction in your wallet and wait for blockchain confirmation...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="relative">
                <CheckCircle className="w-16 h-16 text-green-500" />
                <div className="absolute inset-0 animate-ping">
                  <CheckCircle className="w-16 h-16 text-green-500 opacity-25" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">Transaction Successful!</h3>
              {amount && token && (
                <p className="text-sm text-muted-foreground">
                  Successfully {action === 'Buy' ? 'bought' : 'sold'} {amount} {token}
                </p>
              )}
              {txHash && (
                <div className="flex flex-col items-center gap-3 w-full">
                  <div className="bg-zinc-800 rounded-lg p-3 w-full">
                    <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                    <p className="text-xs font-mono break-all">{txHash}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => window.open(getExplorerUrl(), '_blank')}
                  >
                    View on Explorer
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              )}
              <Button onClick={onClose} className="w-full mt-2">
                Done
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-500" />
              <h3 className="text-xl font-semibold">Transaction Failed</h3>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 w-full">
                <p className="text-sm text-red-400 break-words">
                  {error || 'An unknown error occurred'}
                </p>
              </div>
              <Button onClick={onClose} variant="outline" className="w-full">
                Close
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}