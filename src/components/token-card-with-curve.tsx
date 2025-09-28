"use client";

import { TokenCard } from "./token-card";
import { useBondingCurve } from "@/hooks/useBondingCurve";
import { useEffect, useState } from "react";

interface TokenCardWithCurveProps {
  token: any;
  change24h: string;
  timeSinceLaunch: string;
}

export function TokenCardWithCurve({ token, change24h, timeSinceLaunch }: TokenCardWithCurveProps) {
  const flowCurve = useBondingCurve(token.flowCurve, 'flow');
  const hederaCurve = useBondingCurve(token.hederaCurve, 'hedera');

  // Calculate combined bonding curve progress
  const totalSupply = flowCurve.supply + hederaCurve.supply;
  const maxSupply = 1000000 * 0.9; // 90% of 1M for graduation
  const bondingProgress = (totalSupply / maxSupply) * 100;

  return (
    <TokenCard
      id={token.id}
      name={token.name}
      symbol={token.symbol || token.id}
      description={token.description || "A new meme token on dual chains"}
      change24h={change24h}
      launched={timeSinceLaunch}
      creator={token.creator?.slice(-6) || "Unknown"}
      creatorAddress={token.creator || "0x0000...0000"}
      image={token.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=token${token.id}&backgroundColor=22c55e`}
      bondingProgress={bondingProgress}
      flowCurve={token.flowCurve}
      hederaCurve={token.hederaCurve}
    />
  );
}