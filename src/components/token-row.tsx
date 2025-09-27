"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight } from "lucide-react";
import { useTokenBalance } from "@/hooks/useTokenBalance";

interface TokenRowProps {
  token: any;
  userAddress: string | undefined;
  onTransfer: (token: any, chain: 'flow' | 'hedera') => void;
  isTransferring: boolean;
}

export function TokenRow({ token, userAddress, onTransfer, isTransferring }: TokenRowProps) {
  const flowBalance = useTokenBalance(token.flowAddress, userAddress, 'flow');
  const hederaBalance = useTokenBalance(token.hederaAddress, userAddress, 'hedera');

  const totalBalance = flowBalance + hederaBalance;
  const valueUSD = totalBalance * token.priceUSD;

  if (totalBalance === 0) return null;

  const primaryChain = flowBalance > hederaBalance ? 'flow' : 'hedera';
  const change24h = Math.random() * 40 - 10;

  return (
    <tr className="border-b hover:bg-muted/50 transition-colors">
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
        <div className="flex gap-2">
          {flowBalance > 0 && (
            <Badge variant="outline" className="gap-1">
              <img src="/flow-logo.png" alt="Flow" className="w-3 h-3" />
              Flow: {flowBalance.toFixed(2)}
            </Badge>
          )}
          {hederaBalance > 0 && (
            <Badge variant="outline" className="gap-1">
              <img src="/hedera-logo.png" alt="Hedera" className="w-3 h-3" />
              Hedera: {hederaBalance.toFixed(2)}
            </Badge>
          )}
        </div>
      </td>
      <td className="text-right p-4">
        {totalBalance.toLocaleString()}
      </td>
      <td className="text-right p-4">
        ${token.priceUSD?.toFixed(6) || '0.000000'}
      </td>
      <td className="text-right p-4 font-semibold">
        ${valueUSD.toFixed(2)}
      </td>
      <td className="text-right p-4">
        <div className={`flex items-center justify-end gap-1 ${change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {change24h >= 0 ? (
            <ArrowUpRight className="w-4 h-4" />
          ) : (
            <ArrowDownRight className="w-4 h-4" />
          )}
          {Math.abs(change24h).toFixed(1)}%
        </div>
      </td>
      <td className="text-right p-4">
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline">Trade</Button>
          {flowBalance > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onTransfer({...token, balance: flowBalance, chain: 'flow'}, 'flow')}
              disabled={isTransferring}
              className="gap-1"
            >
              <ArrowLeftRight className="w-3 h-3" />
              Move to Hedera
            </Button>
          )}
          {hederaBalance > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onTransfer({...token, balance: hederaBalance, chain: 'hedera'}, 'hedera')}
              disabled={isTransferring}
              className="gap-1"
            >
              <ArrowLeftRight className="w-3 h-3" />
              Move to Flow
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}