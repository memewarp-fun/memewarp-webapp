import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, base, arbitrum, polygon, optimism, bsc } from 'wagmi/chains';

const flow = {
  id: 747,
  name: 'Flow EVM Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Flow',
    symbol: 'FLOW',
  },
  rpcUrls: {
    default: { http: ['https://mainnet.evm.nodes.onflow.org'] },
    public: { http: ['https://mainnet.evm.nodes.onflow.org'] },
  },
  blockExplorers: {
    default: { name: 'FlowDiver', url: 'https://flowdiver.io' },
  },
  iconUrl: '/flow-logo.png',
} as const;

const hedera = {
  id: 295,
  name: 'Hedera Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HBAR',
    symbol: 'HBAR',
  },
  rpcUrls: {
    default: { http: ['https://lingering-quaint-snowflake.hedera-mainnet.quiknode.pro/9877f9930868999a28c2635f801dc1c8d030d7d5'] },
    public: { http: ['https://lingering-quaint-snowflake.hedera-mainnet.quiknode.pro/9877f9930868999a28c2635f801dc1c8d030d7d5'] },
  },
  blockExplorers: {
    default: { name: 'HashScan', url: 'https://hashscan.io/mainnet' },
  },
  iconUrl: '/hedera-logo.png',
} as const;

export const config = getDefaultConfig({
  appName: 'MemeWarp',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [flow, hedera],
  ssr: true, 
});