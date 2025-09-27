import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { prisma } from '@/lib/db';
import { getPrices } from '@/lib/pyth';
import { CONTRACTS, BONDING_CURVE_ABI } from '@/lib/contracts';

export async function POST(req: Request) {
  try {
    const tokens = await prisma.token.findMany();
    const { flowUsd, hbarUsd } = await getPrices();

    for (const token of tokens) {
      if (!token.flowCurve || !token.hederaCurve) continue;

      const flowProvider = new ethers.providers.JsonRpcProvider(CONTRACTS.flow.rpc);
      const hederaProvider = new ethers.providers.JsonRpcProvider(CONTRACTS.hedera.rpc);

      const flowCurve = new ethers.Contract(token.flowCurve, BONDING_CURVE_ABI, flowProvider);
      const hederaCurve = new ethers.Contract(token.hederaCurve, BONDING_CURVE_ABI, hederaProvider);

      const [flowPrice, flowSupply, hederaPrice, hederaSupply] = await Promise.all([
        flowCurve.getCurrentPrice(),
        flowCurve.getSupply(),
        hederaCurve.getCurrentPrice(),
        hederaCurve.getSupply()
      ]);

      const flowPriceInFlow = parseFloat(ethers.utils.formatEther(flowPrice));
      const hederaPriceInHbar = parseFloat(ethers.utils.formatEther(hederaPrice));
      const flowSupplyFloat = parseFloat(ethers.utils.formatEther(flowSupply));
      const hederaSupplyFloat = parseFloat(ethers.utils.formatEther(hederaSupply));

      const flowPriceUSD = flowPriceInFlow * flowUsd;
      const hederaPriceUSD = hederaPriceInHbar * hbarUsd;

      await prisma.token.update({
        where: { id: token.id },
        data: {
          flowPrice: flowPriceInFlow,
          hederaPrice: hederaPriceInHbar,
          flowSupply: flowSupplyFloat,
          hederaSupply: hederaSupplyFloat,
          flowPriceUSD,
          hederaPriceUSD,
          priceUSD: Math.min(flowPriceUSD, hederaPriceUSD),
          totalSupply: flowSupplyFloat + hederaSupplyFloat,
          marketCapUSD: flowPriceUSD * flowSupplyFloat + hederaPriceUSD * hederaSupplyFloat
        }
      });
    }

    return NextResponse.json({
      synced: tokens.length,
      prices: { flowUsd, hbarUsd },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Sync failed' },
      { status: 500 }
    );
  }
}