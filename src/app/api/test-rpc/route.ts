import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function GET() {
  const results: any = {};

  try {
    console.log('Testing Flow RPC with fetch...');
    const response = await fetch('https://mainnet.evm.nodes.onflow.org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      })
    });

    const data = await response.json();
    console.log('Flow fetch response:', data);

    const flowProvider = new ethers.providers.JsonRpcProvider(
      'https://mainnet.evm.nodes.onflow.org',
      { chainId: 747, name: 'flow' }
    );

    const blockNumber = await flowProvider.getBlockNumber();

    results.flow = {
      success: true,
      blockNumber,
      fetchResult: data.result,
      chainId: 747
    };
    console.log('Flow test success:', results.flow);
  } catch (error: any) {
    console.error('Flow test failed:', error);
    results.flow = {
      success: false,
      error: error.message,
      code: error.code,
      reason: error.reason
    };
  }

  try {
    console.log('Testing Hedera RPC...');
    const hederaProvider = new ethers.providers.JsonRpcProvider(
      'https://mainnet.hashio.io/api',
      { chainId: 295, name: 'hedera' }
    );

    const blockNumber = await hederaProvider.getBlockNumber();
    const balance = await hederaProvider.getBalance('0x0000000000000000000000000000000000000000');

    results.hedera = {
      success: true,
      blockNumber,
      balance: balance.toString(),
      chainId: 295
    };
    console.log('Hedera test success:', results.hedera);
  } catch (error: any) {
    console.error('Hedera test failed:', error);
    results.hedera = {
      success: false,
      error: error.message,
      code: error.code,
      reason: error.reason
    };
  }

  return NextResponse.json(results);
}