import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { CONTRACTS, FACTORY_ABI } from '@/lib/contracts';

export function useTokenFactory(chain: 'flow' | 'hedera') {
  const { address } = useAccount();

  const createToken = async (params: {
    name: string;
    symbol: string;
    description: string;
    imageUrl: string;
    maxSupply: string;
  }) => {
    if (!address) throw new Error('Wallet not connected');

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const factory = new ethers.Contract(
      CONTRACTS[chain].factory,
      FACTORY_ABI,
      signer
    );

    const tx = await factory.createMeme(
      params.name,
      params.symbol,
      params.description,
      params.imageUrl,
      address,
      ethers.utils.parseEther(params.maxSupply)
    );

    const receipt = await tx.wait();
    const event = receipt.events?.find((e: any) => e.event === 'MemeCreated');
    
    return {
      txHash: tx.hash,
      tokenAddress: event?.args?.tokenAddress,
      bondingCurve: event?.args?.bondingCurve
    };
  };

  return { createToken };
}