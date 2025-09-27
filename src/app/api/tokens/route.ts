import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const tokens = await prisma.token.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(tokens);
  } catch (error) {
    console.error('Failed to fetch tokens:', error);
    return NextResponse.json([], { status: 500 });
  }
}