import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    console.log('Cross-chain transfer initiated:', {
      from: data.from,
      to: data.to,
      amount: data.amount,
      tokenSymbol: data.tokenSymbol,
      burnTx: data.burnTx
    });

    return NextResponse.json({
      status: 'pending',
      message: 'Transfer recorded, awaiting cross-chain mint'
    });
  } catch (error) {
    console.error('Error recording transfer:', error);
    return NextResponse.json(
      { error: 'Failed to record transfer' },
      { status: 500 }
    );
  }
}