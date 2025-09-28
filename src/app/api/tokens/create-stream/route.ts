import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { prisma } from '@/lib/db';
import { FACTORY_ABI } from '@/lib/contracts';

const FLOW_RPC = "https://mainnet.evm.nodes.onflow.org";
const HEDERA_RPC = "https://mainnet.hashio.io/api";

export async function POST(req: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const data = await req.json();
        const { name, symbol, description, imageUrl, creator } = data;

        console.log('Token creation request:', { name, symbol, description, imageUrl, creator });

        sendUpdate({ status: 'validating', message: 'Validating token parameters...' });

        if (!process.env.RELAYER_PRIVATE_KEY) {
          throw new Error('Relayer not configured');
        }

        if (!process.env.FLOW_FACTORY_ADDRESS || !process.env.HEDERA_FACTORY_ADDRESS) {
          throw new Error('Factory addresses not configured');
        }

        console.log('Factory addresses:', {
          flow: process.env.FLOW_FACTORY_ADDRESS,
          hedera: process.env.HEDERA_FACTORY_ADDRESS
        });

        const relayerWallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY);
        console.log('Relayer address:', relayerWallet.address);

        sendUpdate({ status: 'connecting', message: 'Connecting to blockchains...' });
        const flowProvider = new ethers.providers.JsonRpcProvider(
          FLOW_RPC,
          { chainId: 747, name: 'flow' }
        );

        const hederaProvider = new ethers.providers.JsonRpcProvider(
          HEDERA_RPC,
          { chainId: 295, name: 'hedera' }
        );

        console.log('RPC endpoints:', { FLOW_RPC, HEDERA_RPC });

        try {
          console.log('Testing Flow connection...');
          const flowBlock = await flowProvider.getBlockNumber();
          console.log('Flow connected, block:', flowBlock);
        } catch (e: any) {
          console.error('Flow RPC connection failed:', e);
          throw new Error(`Cannot connect to Flow network: ${e.message}`);
        }

        try {
          console.log('Testing Hedera connection...');
          const hederaBlock = await hederaProvider.getBlockNumber();
          console.log('Hedera connected, block:', hederaBlock);
        } catch (e: any) {
          console.error('Hedera RPC connection failed:', e);
          throw new Error(`Cannot connect to Hedera network: ${e.message}`);
        }

        const flowSigner = relayerWallet.connect(flowProvider);
        const hederaSigner = relayerWallet.connect(hederaProvider);

        const flowBalance = await flowProvider.getBalance(relayerWallet.address);
        const hederaBalance = await hederaProvider.getBalance(relayerWallet.address);

        console.log('Relayer balances:', {
          flow: ethers.utils.formatEther(flowBalance) + ' FLOW',
          hedera: ethers.utils.formatEther(hederaBalance) + ' HBAR'
        });

        if (flowBalance.isZero()) {
          throw new Error('Relayer has no FLOW tokens for gas');
        }
        if (hederaBalance.isZero()) {
          throw new Error('Relayer has no HBAR tokens for gas');
        }

        const flowFactory = new ethers.Contract(
          process.env.FLOW_FACTORY_ADDRESS,
          FACTORY_ABI,
          flowSigner
        );

        const hederaFactory = new ethers.Contract(
          process.env.HEDERA_FACTORY_ADDRESS,
          FACTORY_ABI,
          hederaSigner
        );

        sendUpdate({ status: 'deploying_flow', message: 'Deploying on Flow blockchain...' });

        const memeParams = {
          name,
          symbol,
          description,
          imageUrl,
          creator,
          maxSupply: ethers.utils.parseEther("1000000")
        };

        console.log('Deploying on Flow with params:', memeParams);

        const flowTx = await flowFactory.createMeme(memeParams);

        console.log('Flow transaction submitted:', flowTx.hash);

        sendUpdate({
          status: 'confirming_flow',
          message: 'Waiting for Flow confirmation...',
          flowTx: flowTx.hash
        });

        sendUpdate({ status: 'deploying_hedera', message: 'Deploying on Hedera blockchain...' });

        console.log('Deploying on Hedera with same params');

        const hederaTx = await hederaFactory.createMeme(memeParams);

        console.log('Hedera transaction submitted:', hederaTx.hash);

        sendUpdate({
          status: 'confirming_hedera',
          message: 'Waiting for Hedera confirmation...',
          hederaTx: hederaTx.hash
        });

        const [flowReceipt, hederaReceipt] = await Promise.all([
          flowTx.wait(),
          hederaTx.wait()
        ]);

        console.log('Both transactions confirmed');
        console.log('Flow receipt events:', flowReceipt.events);
        console.log('Hedera receipt events:', hederaReceipt.events);

        sendUpdate({ status: 'storing', message: 'Storing token data...' });

        const flowEvent = flowReceipt.events?.find((e: any) => e.event === 'MemeCreated');
        const hederaEvent = hederaReceipt.events?.find((e: any) => e.event === 'MemeCreated');

        console.log('Parsed events:', {
          flowEvent: flowEvent?.args,
          hederaEvent: hederaEvent?.args
        });

        const flowMemeId = flowEvent?.args?.memeId || flowEvent?.args?.[0];
        const hederaMemeId = hederaEvent?.args?.memeId || hederaEvent?.args?.[0];

        console.log('Extracted memeIds:', {
          flowMemeId: flowMemeId?.toString(),
          hederaMemeId: hederaMemeId?.toString()
        });

        sendUpdate({ status: 'setting-relayer', message: 'Setting up cross-chain relayer...' });

        if (flowMemeId) {
          try {
            console.log('Setting Flow relayer for memeId:', flowMemeId.toString(), 'relayer:', relayerWallet.address);
            const setRelayerTx = await flowFactory.setCurveRelayer(flowMemeId, relayerWallet.address);
            await setRelayerTx.wait();
            console.log('✓ Flow relayer set successfully for memeId:', flowMemeId.toString());
          } catch (error: any) {
            console.error('✗ Failed to set Flow relayer:', error.message);
            sendUpdate({ status: 'warning', message: `Flow relayer setup failed: ${error.message}` });
          }
        } else {
          console.log('No Flow memeId found in event');
        }

        if (hederaMemeId) {
          try {
            console.log('Setting Hedera relayer for memeId:', hederaMemeId.toString(), 'relayer:', relayerWallet.address);
            const setRelayerTx = await hederaFactory.setCurveRelayer(hederaMemeId, relayerWallet.address);
            await setRelayerTx.wait();
            console.log('✓ Hedera relayer set successfully for memeId:', hederaMemeId.toString());
          } catch (error: any) {
            console.error('✗ Failed to set Hedera relayer:', error.message);
            sendUpdate({ status: 'warning', message: `Hedera relayer setup failed: ${error.message}` });
          }
        } else {
          console.log('No Hedera memeId found in event');
        }

        const tokenData = {
          id: symbol,
          name,
          description,
          imageUrl,
          creator,
          flowAddress: flowEvent?.args?.token || flowEvent?.args?.tokenAddress,
          hederaAddress: hederaEvent?.args?.token || hederaEvent?.args?.tokenAddress,
          flowCurve: flowEvent?.args?.curve || flowEvent?.args?.bondingCurve,
          hederaCurve: hederaEvent?.args?.curve || hederaEvent?.args?.bondingCurve
        };

        console.log('Creating token in database:', tokenData);

        const token = await prisma.token.create({
          data: tokenData
        });

        console.log('Token created in database:', token);

        sendUpdate({
          status: 'completed',
          message: 'Token created successfully!',
          token,
          flowTx: flowTx.hash,
          hederaTx: hederaTx.hash
        });

      } catch (error: any) {
        console.error('Token creation error:', error);
        console.error('Error stack:', error.stack);

        sendUpdate({
          status: 'error',
          message: error.message || 'Failed to create token'
        });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}