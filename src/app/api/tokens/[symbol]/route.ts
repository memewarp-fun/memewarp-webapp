import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const token = await prisma.token.findUnique({
      where: { id: symbol }
    });

    if (!token) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(token);
  } catch (error) {
    console.error('Error fetching token:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token' },
      { status: 500 }
    );
  }
}