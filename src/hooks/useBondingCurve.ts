import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { CONTRACTS, BONDING_CURVE_ABI } from '@/lib/contracts';

export function useBondingCurve(curveAddress: string, chain: 'flow' | 'hedera') {
  const { address } = useAccount();
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [supply, setSupply] = useState<number>(0);

  useEffect(() => {
    if (!curveAddress) return;

    const fetchData = async () => {
      const provider = new ethers.providers.JsonRpcProvider(CONTRACTS[chain].rpc);
      const curve = new ethers.Contract(curveAddress, BONDING_CURVE_ABI, provider);
      
      const [price, totalSupply] = await Promise.all([
        curve.getCurrentPrice(),
        curve.getSupply()
      ]);

      setCurrentPrice(parseFloat(ethers.utils.formatEther(price)));
      setSupply(parseFloat(ethers.utils.formatEther(totalSupply)));
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [curveAddress, chain]);

  const buy = async (amount: string) => {
    if (!address) throw new Error('Wallet not connected');

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const curve = new ethers.Contract(curveAddress, BONDING_CURVE_ABI, signer);

    const amountWei = ethers.utils.parseEther(amount);
    const quote = await curve.calculateBuyQuote(amountWei);
    
    const tx = await curve.buy(amountWei, { value: quote.cost });
    return tx.wait();
  };

  const sell = async (amount: string) => {
    if (!address) throw new Error('Wallet not connected');

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const curve = new ethers.Contract(curveAddress, BONDING_CURVE_ABI, signer);

    const amountWei = ethers.utils.parseEther(amount);
    const tx = await curve.sell(amountWei);
    return tx.wait();
  };

  const getQuote = async (amount: string, type: 'buy' | 'sell') => {
    const provider = new ethers.providers.JsonRpcProvider(CONTRACTS[chain].rpc);
    const curve = new ethers.Contract(curveAddress, BONDING_CURVE_ABI, provider);
    
    const amountWei = ethers.utils.parseEther(amount);
    const quote = type === 'buy' 
      ? await curve.calculateBuyQuote(amountWei)
      : await curve.calculateSellQuote(amountWei);
    
    return {
      cost: ethers.utils.formatEther(quote.cost || quote.proceeds),
      fee: ethers.utils.formatEther(quote.fee)
    };
  };

  const burnForCrossChain = async (amount: string, targetChain: 'flow' | 'hedera') => {
    if (!address) throw new Error('Wallet not connected');

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const curve = new ethers.Contract(curveAddress, BONDING_CURVE_ABI, signer);

    const amountWei = ethers.utils.parseEther(amount);
    const targetChainId = CONTRACTS[targetChain].chainId;
    
    const tx = await curve.burnForCrossChain(
      address,
      amountWei,
      address,
      targetChainId
    );
    return tx.wait();
  };

  return {
    currentPrice,
    supply,
    buy,
    sell,
    getQuote,
    burnForCrossChain
  };
}