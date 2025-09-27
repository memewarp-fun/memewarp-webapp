import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import { TOKEN_ABI, CONTRACTS } from '@/lib/contracts';

export function useTokenBalance(tokenAddress: string | undefined, userAddress: string | undefined, chain: 'flow' | 'hedera') {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!tokenAddress || !userAddress) return;

    const fetchBalance = async () => {
      try {
        const provider = new ethers.providers.JsonRpcProvider(CONTRACTS[chain].rpc);
        const token = new ethers.Contract(tokenAddress, TOKEN_ABI, provider);
        const bal = await token.balanceOf(userAddress);
        setBalance(parseFloat(ethers.utils.formatEther(bal)));
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance(0);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [tokenAddress, userAddress, chain]);

  return balance;
}