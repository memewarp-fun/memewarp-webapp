import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ethers } from 'ethers';
import { CONTRACTS, BONDING_CURVE_ABI } from '@/lib/contracts';

export async function GET() {
  try {
    let tokens = await prisma.token.findMany({
      orderBy: { marketCapUSD: 'desc' }
    });

    if (tokens.length === 0) {
      const flowProvider = new ethers.providers.JsonRpcProvider(CONTRACTS.flow.rpc);
      const hederaProvider = new ethers.providers.JsonRpcProvider(CONTRACTS.hedera.rpc);
      
      tokens = [];
    }

    return NextResponse.json(tokens);
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    const token = await prisma.token.create({
      data: {
        id: data.id,
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        creator: data.creator,
        flowAddress: data.flowAddress,
        hederaAddress: data.hederaAddress,
        flowCurve: data.flowCurve,
        hederaCurve: data.hederaCurve
      }
    });

    return NextResponse.json(token);
  } catch (error) {
    console.error('Error creating token:', error);
    return NextResponse.json(
      { error: 'Failed to create token' },
      { status: 500 }
    );
  }
}