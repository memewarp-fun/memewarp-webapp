import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { CONTRACTS, BONDING_CURVE_ABI } from '@/lib/contracts';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { from, to, amount, tokenSymbol, userAddress, curveAddress, tokenId, targetCurveAddress } = data;

    if (!curveAddress || !userAddress || !amount) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const sourceChain = from as 'flow' | 'hedera';
    const targetChain = to as 'flow' | 'hedera';
    const targetChainId = targetChain === 'flow' ? 747 : 295;

    const provider = new ethers.providers.JsonRpcProvider(
      CONTRACTS[sourceChain].rpc,
      { chainId: CONTRACTS[sourceChain].chainId, name: sourceChain }
    );

    const privateKey = process.env.RELAYER_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { error: 'Relayer not configured' },
        { status: 500 }
      );
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    const bondingCurve = new ethers.Contract(curveAddress, BONDING_CURVE_ABI, wallet);

    const amountWei = ethers.utils.parseEther(amount);


    const tx = await bondingCurve.burnForCrossChain(
      userAddress,
      amountWei,
      userAddress,
      targetChainId
    );


    const receipt = await tx.wait();


    if (!targetCurveAddress) {
      return NextResponse.json({
        status: 'burn-only',
        burnTxHash: receipt.transactionHash,
        message: `Tokens burned on ${sourceChain}. Awaiting relayer for mint on ${targetChain}.`
      });
    }

    const targetProvider = new ethers.providers.JsonRpcProvider(
      CONTRACTS[targetChain].rpc,
      { chainId: CONTRACTS[targetChain].chainId, name: targetChain }
    );

    const targetWallet = new ethers.Wallet(privateKey, targetProvider);

    const targetBondingCurve = new ethers.Contract(targetCurveAddress, BONDING_CURVE_ABI, targetWallet);


    try {
      const sourceChainId = CONTRACTS[sourceChain].chainId;


      const mintTx = await targetBondingCurve.mintFromCrossChain(
        userAddress,
        amountWei,
        userAddress,
        sourceChainId
      );

      const mintReceipt = await mintTx.wait();

      return NextResponse.json({
        status: 'success',
        burnTxHash: receipt.transactionHash,
        mintTxHash: mintReceipt.transactionHash,
        message: `Transfer complete! Tokens moved from ${sourceChain} to ${targetChain}.`
      });

    } catch (mintError: any) {

      return NextResponse.json({
        status: 'burn-complete',
        burnTxHash: receipt.transactionHash,
        message: `Tokens burned on ${sourceChain}. Mint will be processed by relayer service.`,
        details: {
          burnChain: sourceChain,
          targetChain,
          amount,
          burnTxHash: receipt.transactionHash,
          targetCurve: targetCurveAddress,
          recipient: userAddress
        }
      });
    }

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to process transfer' },
      { status: 500 }
    );
  }
}