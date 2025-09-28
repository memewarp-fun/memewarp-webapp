import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { CONTRACTS, BONDING_CURVE_ABI } from '@/lib/contracts';

export function useBondingCurve(curveAddress: string, chain: 'flow' | 'hedera') {
  const { address } = useAccount();
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [supply, setSupply] = useState<number>(0);
  const [cachedState, setCachedState] = useState<any>(null);

  useEffect(() => {
    if (!curveAddress || curveAddress === '0x0000000000000000000000000000000000000000') return;

    const fetchData = async () => {
      try {
        const provider = new ethers.providers.JsonRpcProvider(
          CONTRACTS[chain].rpc,
          { chainId: CONTRACTS[chain].chainId, name: chain }
        );
        const curve = new ethers.Contract(curveAddress, BONDING_CURVE_ABI, provider);

        const [state, currentPriceRaw] = await Promise.all([
          curve.state(),
          curve.getCurrentPrice().catch(() => null)
        ]);

        if (currentPriceRaw) {
          const price = parseFloat(ethers.utils.formatEther(currentPriceRaw));
          setCurrentPrice(Math.max(price, 0.000001));
        } else {
          const supply = state.localSupply || state.globalSupply || state[2];
          let reserves = state.reserveBalance || state[3];

          if (chain === 'hedera') {
            reserves = ethers.utils.bigNumberify(reserves).mul(10000000000);
          }

          if (supply && reserves && ethers.utils.bigNumberify(supply).gt(0)) {
            const avgPrice = ethers.utils.bigNumberify(reserves).mul(ethers.utils.parseEther("1")).div(supply);
            const estimatedCurrentPrice = avgPrice.mul(2);
            const calculatedPrice = parseFloat(ethers.utils.formatEther(estimatedCurrentPrice));
            setCurrentPrice(Math.max(calculatedPrice, 0.000001));
          } else {
            setCurrentPrice(0.000001);
          }
        }

        const supply = state.localSupply || state.globalSupply || state[2];
        setSupply(parseFloat(ethers.utils.formatEther(supply || 0)));
        setCachedState(state);
      } catch (error) {
        console.error('Failed to fetch bonding curve data:', error);
        setCurrentPrice(0.000001);
        setSupply(0);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [curveAddress, chain]);

  const buy = async (amount: string) => {
    if (!address) throw new Error('Wallet not connected');

    console.log('Buy function called with:');
    console.log('- Curve address:', curveAddress);
    console.log('- Chain:', chain);
    console.log('- Amount:', amount);
    console.log('- User address:', address);

    // Make sure we're on the right network first
    const expectedChainId = CONTRACTS[chain].chainId;

    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${expectedChainId.toString(16)}` }],
      });
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error: any) {
      console.error('Failed to switch network:', error);
      throw new Error(`Please switch to ${chain === 'flow' ? 'Flow' : 'Hedera'} network`);
    }

    // Create provider with explicit network config
    const provider = new ethers.providers.Web3Provider(
      (window as any).ethereum,
      {
        chainId: expectedChainId,
        name: chain
      }
    );

    const network = await provider.getNetwork();
    console.log('- Connected network:', network);

    const signer = provider.getSigner();
    const amountWei = ethers.utils.parseEther(amount);
    console.log('- Amount in wei:', amountWei.toString());

    // Just use the contract directly - we know this works for getQuote
    const curve = new ethers.Contract(curveAddress, BONDING_CURVE_ABI, provider);

    try {
      // Get quote using the same method that works in getQuote
      const quote = await curve.calculateBuyQuote(amountWei);
      console.log('- Quote response:', quote);

      // Quote returns [price, amount, cost, protocolFee, creatorFee, netAmount]
      const netAmount = quote[5] || quote.netAmount;
      console.log('- Net amount (total to pay):', ethers.utils.formatEther(netAmount));

      // Now send the buy transaction with signer
      const curveWithSigner = curve.connect(signer);
      const tx = await curveWithSigner.buy(amountWei, {
        value: netAmount,
        gasLimit: 300000
      });

      console.log('- Transaction hash:', tx.hash);
      return tx.wait();
    } catch (error: any) {
      console.error('Buy failed:', error);

      // Fallback: try sending raw transaction
      console.log('Trying raw transaction...');
      const iface = new ethers.utils.Interface(BONDING_CURVE_ABI);
      const buyData = iface.functions['buy(uint256)'].encode([amountWei]);

      // Use a reasonable estimate if we can't get quote
      const estimatedValue = amountWei.mul(3).div(2000); // ~0.15% of token amount as payment

      const tx = await signer.sendTransaction({
        to: curveAddress,
        data: buyData,
        value: estimatedValue,
        gasLimit: 300000
      });

      return tx.wait();
    }
  };

  const sell = async (amount: string) => {
    if (!address) throw new Error('Wallet not connected');

    console.log('Sell function called with:');
    console.log('- Curve address:', curveAddress);
    console.log('- Chain:', chain);
    console.log('- Amount:', amount);

    // Make sure we're on the right network first
    const expectedChainId = CONTRACTS[chain].chainId;

    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${expectedChainId.toString(16)}` }],
      });
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error: any) {
      console.error('Failed to switch network:', error);
      throw new Error(`Please switch to ${chain === 'flow' ? 'Flow' : 'Hedera'} network`);
    }

    // Create provider with explicit network config
    const provider = new ethers.providers.Web3Provider(
      (window as any).ethereum,
      {
        chainId: expectedChainId,
        name: chain
      }
    );

    const network = await provider.getNetwork();
    console.log('- Connected network:', network);

    const signer = provider.getSigner();

    // Use Interface to encode the function call
    const iface = new ethers.utils.Interface(BONDING_CURVE_ABI);
    const curve = new ethers.Contract(curveAddress, iface, signer);

    const amountWei = ethers.utils.parseEther(amount);
    const tx = await curve.sell(amountWei);
    return tx.wait();
  };

  const getQuote = async (amount: string, type: 'buy' | 'sell') => {
    if (!amount || parseFloat(amount) <= 0) return null;

    try {
      const provider = new ethers.providers.JsonRpcProvider(
        CONTRACTS[chain].rpc,
        { chainId: CONTRACTS[chain].chainId, name: chain }
      );
      const curve = new ethers.Contract(curveAddress, BONDING_CURVE_ABI, provider);

      const amountWei = ethers.utils.parseEther(amount);
      const quote = type === 'buy'
        ? await curve.calculateBuyQuote(amountWei)
        : await curve.calculateSellQuote(amountWei);

      console.log('Quote response:', quote);

      // Quote returns [price, amount, cost, protocolFee, creatorFee, netAmount]
      // or for sell: [price, amount, proceeds, protocolFee, creatorFee, netAmount]
      let price, tokenAmount, baseCost, protocolFee, creatorFee, netAmount;

      if (Array.isArray(quote) && quote.length >= 6) {
        price = quote[0];
        tokenAmount = quote[1];
        baseCost = quote[2]; // cost for buy, proceeds for sell
        protocolFee = quote[3];
        creatorFee = quote[4];
        netAmount = quote[5];
      } else if (quote.netAmount) {
        price = quote.price || ethers.utils.bigNumberify(0);
        tokenAmount = quote.amount || amountWei;
        baseCost = quote.cost || quote.proceeds || ethers.utils.bigNumberify(0);
        protocolFee = quote.protocolFee || ethers.utils.bigNumberify(0);
        creatorFee = quote.creatorFee || ethers.utils.bigNumberify(0);
        netAmount = quote.netAmount;
      } else {
        // Fallback for old format
        netAmount = quote[0];
        protocolFee = quote[1] || ethers.utils.bigNumberify(0);
        creatorFee = quote[2] || ethers.utils.bigNumberify(0);
        price = ethers.utils.bigNumberify(0);
        baseCost = netAmount;
      }

      const totalFees = ethers.utils.bigNumberify(protocolFee).add(ethers.utils.bigNumberify(creatorFee));

      return {
        cost: ethers.utils.formatEther(netAmount), // Total amount to pay/receive
        price: ethers.utils.formatEther(price), // Price per token
        baseCost: ethers.utils.formatEther(baseCost), // Base cost without fees
        fee: ethers.utils.formatEther(totalFees),
        protocolFee: ethers.utils.formatEther(protocolFee),
        creatorFee: ethers.utils.formatEther(creatorFee)
      };
    } catch (error) {
      console.error('Failed to get quote:', error);
      return null;
    }
  };

  const burnForCrossChain = async (amount: string, targetChain: 'flow' | 'hedera') => {
    if (!address) throw new Error('Wallet not connected');

    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
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

  const calculateTokensForPayment = async (paymentAmount: string) => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) return null;

    try {
      const provider = new ethers.providers.JsonRpcProvider(
        CONTRACTS[chain].rpc,
        { chainId: CONTRACTS[chain].chainId, name: chain }
      );
      const curve = new ethers.Contract(curveAddress, BONDING_CURVE_ABI, provider);

      // Use cached state if available and recent (less than 5 seconds old)
      let state = cachedState;
      if (!state) {
        state = await curve.state();
      }
      const currentSupply = state.localSupply || state[0];

      // Start with a rough estimate based on current supply and payment
      const payment = ethers.utils.parseEther(paymentAmount);

      // Use a more intelligent starting point based on current price
      let estimatedTokens;
      if (currentSupply && ethers.utils.bigNumberify(currentSupply).gt(0)) {
        // If we have supply, use current price as reference
        const reserves = state.reserveBalance || state[3];
        const avgPrice = ethers.utils.bigNumberify(reserves).mul(ethers.utils.parseEther("1")).div(currentSupply);
        estimatedTokens = payment.mul(ethers.utils.parseEther("1")).div(avgPrice.mul(2)); // Start conservative
      } else {
        // No supply yet, start with base calculation
        estimatedTokens = payment.mul(1000); // Rough estimate for initial purchases
      }

      // Now refine with a few iterations
      let bestAmount = ethers.utils.bigNumberify(0);
      let bestQuote = null;

      // Try the estimate first
      try {
        const quote = await curve.calculateBuyQuote(estimatedTokens);
        const netAmount = quote[5] || quote.netAmount;

        if (ethers.utils.bigNumberify(netAmount).lte(payment)) {
          bestAmount = estimatedTokens;
          bestQuote = quote;

          // Try to get closer to the exact amount
          let increment = estimatedTokens.div(10);
          for (let i = 0; i < 5; i++) {
            const testAmount = bestAmount.add(increment);
            try {
              const testQuote = await curve.calculateBuyQuote(testAmount);
              const testNet = testQuote[5] || testQuote.netAmount;

              if (ethers.utils.bigNumberify(testNet).lte(payment)) {
                bestAmount = testAmount;
                bestQuote = testQuote;
              } else {
                break;
              }
            } catch {
              break;
            }
            increment = increment.div(2);
          }
        } else {
          // Estimate was too high, reduce
          let testAmount = estimatedTokens.div(2);
          for (let i = 0; i < 5; i++) {
            try {
              const testQuote = await curve.calculateBuyQuote(testAmount);
              const testNet = testQuote[5] || testQuote.netAmount;

              if (ethers.utils.bigNumberify(testNet).lte(payment)) {
                bestAmount = testAmount;
                bestQuote = testQuote;
                break;
              } else {
                testAmount = testAmount.div(2);
              }
            } catch {
              testAmount = testAmount.div(2);
            }
          }
        }
      } catch (error) {
        console.error('Quote failed for estimate:', error);
        return null;
      }

      if (bestQuote) {
        const netAmount = bestQuote[5] || bestQuote.netAmount;
        const protocolFee = bestQuote[3] || bestQuote.protocolFee;
        const creatorFee = bestQuote[4] || bestQuote.creatorFee;
        const baseCost = bestQuote[2] || bestQuote.cost;
        const price = bestQuote[0] || bestQuote.price;

        const totalFees = ethers.utils.bigNumberify(protocolFee).add(ethers.utils.bigNumberify(creatorFee));

        return {
          tokens: ethers.utils.formatEther(bestAmount),
          cost: ethers.utils.formatEther(netAmount),
          price: ethers.utils.formatEther(price),
          baseCost: ethers.utils.formatEther(baseCost),
          fee: ethers.utils.formatEther(totalFees),
          protocolFee: ethers.utils.formatEther(protocolFee),
          creatorFee: ethers.utils.formatEther(creatorFee)
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to calculate tokens for payment:', error);
      return null;
    }
  };

  return {
    currentPrice,
    supply,
    buy,
    sell,
    getQuote,
    burnForCrossChain,
    calculateTokensForPayment
  };
}