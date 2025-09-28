import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { CONTRACTS, FACTORY_ABI } from '@/lib/contracts';

export async function POST(req: Request) {
  try {
    const { memeId, chain } = await req.json();

    const privateKey = process.env.RELAYER_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { error: 'Relayer private key not configured' },
        { status: 500 }
      );
    }

    const chainKey = chain as 'flow' | 'hedera';
    const provider = new ethers.providers.JsonRpcProvider(
      CONTRACTS[chainKey].rpc,
      { chainId: CONTRACTS[chainKey].chainId, name: chain }
    );

    const wallet = new ethers.Wallet(privateKey, provider);
    const relayerAddress = wallet.address;

    const factory = new ethers.Contract(CONTRACTS[chainKey].factory, FACTORY_ABI, wallet);

    try {
      const tx = await factory.setRelayer(relayerAddress);
      await tx.wait();
    } catch (e) {
    }

    try {
      const tx2 = await factory.setCurveRelayer(memeId, relayerAddress);
      await tx2.wait();

      return NextResponse.json({
        success: true,
        memeId,
        chain,
        relayerAddress,
        message: `Relayer set for meme ${memeId} on ${chain}`
      });

    } catch (error: any) {
      return NextResponse.json(
        { error: `Failed to set curve relayer: ${error.message}` },
        { status: 500 }
      );
    }

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to set relayer' },
      { status: 500 }
    );
  }
}