"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useBondingCurve } from "@/hooks/useBondingCurve";
import { useRouter } from "next/navigation";
import React from "react";
import { getPrices } from "@/lib/pyth";

interface PortfolioTokenRowProps {
  token: any;
  userAddress: string | undefined;
  onTransfer: (token: any, chain: 'flow' | 'hedera') => void;
  isTransferring: boolean;
  onBalanceUpdate?: (tokenId: string, flowBalance: number, hederaBalance: number, totalValue: number) => void;
  selectedChain?: "all" | "flow" | "hedera";
}

export function PortfolioTokenRow({
  token,
  userAddress,
  onTransfer,
  isTransferring,
  onBalanceUpdate,
  selectedChain = "all"
}: PortfolioTokenRowProps) {
  const router = useRouter();
  const { balance: flowBalance } = useTokenBalance(token.flowAddress, userAddress, 'flow');
  const { balance: hederaBalance } = useTokenBalance(token.hederaAddress, userAddress, 'hedera');
  const [usdPrices, setUsdPrices] = React.useState<{flowUsd: number, hbarUsd: number} | null>(null);

  const flowCurve = useBondingCurve(token.flowCurve, 'flow');
  const hederaCurve = useBondingCurve(token.hederaCurve, 'hedera');

  const totalBalance = flowBalance + hederaBalance;

  React.useEffect(() => {
    getPrices().then(setUsdPrices).catch(console.error);
  }, []);

  const flowValueInFlow = flowBalance * flowCurve.currentPrice;
  const hederaValueInHbar = hederaBalance * hederaCurve.currentPrice;

  const flowValueUsd = usdPrices ? flowValueInFlow * usdPrices.flowUsd : 0;
  const hederaValueUsd = usdPrices ? hederaValueInHbar * usdPrices.hbarUsd : 0;
  const totalValue = flowValueUsd + hederaValueUsd;

  React.useEffect(() => {
    if (onBalanceUpdate) {
      onBalanceUpdate(token.id, flowBalance, hederaBalance, totalValue);
    }
  }, [flowBalance, hederaBalance, totalValue]);

  if (totalBalance === 0) return null;

  if (selectedChain === "flow" && flowBalance === 0) return null;
  if (selectedChain === "hedera" && hederaBalance === 0) return null;

  return (
    <tr className="border-b hover:bg-muted/50 transition-colors">
      <td className="p-4">
        <div className="flex items-center gap-3">
          {token.imageUrl ? (
            <img src={token.imageUrl} alt={token.name} className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-500 rounded-full" />
          )}
          <div>
            <p className="font-semibold">{token.name}</p>
            <p className="text-sm text-muted-foreground">{token.symbol}</p>
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="flex gap-2">
          {flowBalance > 0 && (
            <Badge variant="outline" className="gap-1">
              <img src="/flow-logo.png" alt="Flow" className="w-3 h-3" />
              Flow
            </Badge>
          )}
          {hederaBalance > 0 && (
            <Badge variant="outline" className="gap-1">
              <img src="/hedera-logo.png" alt="Hedera" className="w-3 h-3" />
              Hedera
            </Badge>
          )}
        </div>
      </td>
      <td className="text-right p-4">
        {flowBalance > 0 ? (
          <div>
            <div className="font-medium">{flowBalance.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              ${flowValueUsd.toFixed(2)}
            </div>
          </div>
        ) : '-'}
      </td>
      <td className="text-right p-4">
        {hederaBalance > 0 ? (
          <div>
            <div className="font-medium">{hederaBalance.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              ${hederaValueUsd.toFixed(2)}
            </div>
          </div>
        ) : '-'}
      </td>
      <td className="text-right p-4">
        <div>
          <div className="font-bold">{totalBalance.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">
            ${totalValue.toFixed(2)}
          </div>
        </div>
      </td>
      <td className="text-right p-4">
        <div className="flex gap-2 justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push(`/token/${token.id}`)}
          >
            Trade
          </Button>
          {flowBalance > 0 && hederaBalance === 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onTransfer({...token, balance: flowBalance, chain: 'flow'}, 'flow')}
              disabled={isTransferring}
              className="gap-1"
            >
              <ArrowLeftRight className="w-3 h-3" />
              → Hedera
            </Button>
          )}
          {hederaBalance > 0 && flowBalance === 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onTransfer({...token, balance: hederaBalance, chain: 'hedera'}, 'hedera')}
              disabled={isTransferring}
              className="gap-1"
            >
              <ArrowLeftRight className="w-3 h-3" />
              → Flow
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}