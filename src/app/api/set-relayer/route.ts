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

    const provider = new ethers.providers.JsonRpcProvider(
      CONTRACTS[chain].rpc,
      { chainId: CONTRACTS[chain].chainId, name: chain }
    );

    const wallet = new ethers.Wallet(privateKey, provider);
    const relayerAddress = wallet.address;

    const factory = new ethers.Contract(CONTRACTS[chain].factory, FACTORY_ABI, wallet);

    console.log('Setting relayer for meme:', {
      memeId,
      chain,
      relayerAddress,
      factoryAddress: CONTRACTS[chain].factory
    });

    try {
      const tx = await factory.setRelayer(relayerAddress);
      await tx.wait();
      console.log('Factory relayer set:', tx.hash);
    } catch (e) {
      console.log('Factory relayer may already be set or not owner');
    }

    try {
      const tx2 = await factory.setCurveRelayer(memeId, relayerAddress);
      await tx2.wait();
      console.log('Curve relayer set for memeId:', memeId, 'tx:', tx2.hash);

      return NextResponse.json({
        success: true,
        memeId,
        chain,
        relayerAddress,
        message: `Relayer set for meme ${memeId} on ${chain}`
      });

    } catch (error: any) {
      console.error('Error setting curve relayer:', error);
      return NextResponse.json(
        { error: `Failed to set curve relayer: ${error.message}` },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error setting relayer:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to set relayer' },
      { status: 500 }
    );
  }
}