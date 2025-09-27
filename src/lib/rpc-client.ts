import { ethers } from 'ethers';

export class CustomJsonRpcProvider extends ethers.providers.JsonRpcProvider {
  async send(method: string, params: any[]): Promise<any> {
    const response = await fetch(this.connection.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method,
        params,
        id: Date.now(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'RPC Error');
    }

    return data.result;
  }
}

export function createProvider(rpcUrl: string, chainId: number) {
  // Create a custom provider that uses fetch instead of the built-in HTTP client
  const provider = new CustomJsonRpcProvider(rpcUrl, {
    chainId,
    name: chainId === 747 ? 'flow' : 'hedera'
  });

  // Override the detection to avoid the network call
  (provider as any)._network = {
    chainId,
    name: chainId === 747 ? 'flow' : 'hedera'
  };

  return provider;
}