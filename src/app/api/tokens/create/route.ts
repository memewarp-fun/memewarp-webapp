import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { prisma } from '@/lib/db';
import { FACTORY_ABI } from '@/lib/contracts';

const FLOW_RPC = "https://mainnet.evm.nodes.onflow.org";
const HEDERA_RPC = "https://mainnet.hashio.io/api";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, symbol, description, imageUrl, creator } = data;

    if (!process.env.RELAYER_PRIVATE_KEY) {
      throw new Error('Relayer not configured');
    }

    if (!process.env.FLOW_FACTORY_ADDRESS || !process.env.HEDERA_FACTORY_ADDRESS) {
      throw new Error('Factory addresses not configured');
    }

    const relayerWallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY);

    const flowProvider = new ethers.providers.JsonRpcProvider(FLOW_RPC, { chainId: 747, name: 'flow' });
    const hederaProvider = new ethers.providers.JsonRpcProvider(HEDERA_RPC, { chainId: 295, name: 'hedera' });

    const flowSigner = relayerWallet.connect(flowProvider);
    const hederaSigner = relayerWallet.connect(hederaProvider);

    const flowFactory = new ethers.Contract(
      process.env.FLOW_FACTORY_ADDRESS,
      FACTORY_ABI,
      flowSigner
    );

    const hederaFactory = new ethers.Contract(
      process.env.HEDERA_FACTORY_ADDRESS,
      FACTORY_ABI,
      hederaSigner
    );

    console.log('Deploying token on Flow...');
    const flowTx = await flowFactory.createMeme(
      name,
      symbol,
      description,
      imageUrl,
      creator,
      ethers.utils.parseEther("1000000")
    );

    console.log('Deploying token on Hedera...');
    const hederaTx = await hederaFactory.createMeme(
      name,
      symbol,
      description,
      imageUrl,
      creator,
      ethers.utils.parseEther("1000000")
    );

    const [flowReceipt, hederaReceipt] = await Promise.all([
      flowTx.wait(),
      hederaTx.wait()
    ]);

    const flowEvent = flowReceipt.events?.find((e: any) => e.event === 'MemeCreated');
    const hederaEvent = hederaReceipt.events?.find((e: any) => e.event === 'MemeCreated');

    const token = await prisma.token.create({
      data: {
        id: symbol,
        name,
        description,
        imageUrl,
        creator,
        flowAddress: flowEvent?.args?.tokenAddress,
        hederaAddress: hederaEvent?.args?.tokenAddress,
        flowCurve: flowEvent?.args?.bondingCurve,
        hederaCurve: hederaEvent?.args?.bondingCurve
      }
    });

    return NextResponse.json({
      success: true,
      token,
      flowTx: flowTx.hash,
      hederaTx: hederaTx.hash
    });

  } catch (error: any) {
    console.error('Token creation failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create token' },
      { status: 500 }
    );
  }
}