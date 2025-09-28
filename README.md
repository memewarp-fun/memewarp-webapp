# MemeWarp 🚀

A cross-chain meme token launchpad built on Flow and Hedera blockchains, enabling seamless token creation and trading across multiple chains.

## Features

- **Cross-Chain Token Launches** - Deploy meme tokens simultaneously on Flow and Hedera
- **Bonding Curve Trading** - Automated market making with bonding curves
- **Chain Bridging** - Transfer tokens between Flow and Hedera seamlessly
- **Live Streaming Integration** - Launch tokens with live video streams
- **Portfolio Management** - Track your holdings across both chains
- **Real-time Price Updates** - Live price feeds from Pyth Network

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Blockchain**: Flow EVM, Hedera
- **Web3**: ethers.js, wagmi, RainbowKit
- **Database**: PostgreSQL with Prisma
- **UI Components**: shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Flow and Hedera RPC endpoints

### Installation

1. Clone the repository:
```bash
git clone https://github.com/memewarp-fun/memewarp-webapp.git
cd memewarp-webapp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your configuration to `.env.local`:
```env
DATABASE_URL="your_postgres_connection_string"
RELAYER_PRIVATE_KEY="your_relayer_private_key"
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your_walletconnect_id"
```

4. Set up the database:
```bash
npx prisma migrate dev
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   └── ...          # Feature components
├── hooks/           # Custom React hooks
├── lib/             # Utilities and configurations
└── providers/       # Context providers
```

## Key Features Explained

### Bonding Curves
Tokens are launched with bonding curves that automatically adjust price based on supply. When a token reaches 90% of max supply (900,000 tokens), it graduates to a full DEX.

### Cross-Chain Bridge
Users can burn tokens on one chain and mint them on another, maintaining the same total supply across both chains.

### Live Streaming
Create tokens while live streaming to engage your community from day one.

## Smart Contracts

The app interacts with deployed smart contracts on:
- **Flow EVM**: Factory and Bonding Curve contracts
- **Hedera**: Factory and Bonding Curve contracts

Contract addresses are configured in `src/lib/contracts.ts`.

## Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```


---

Built with ❤️ and ☕ for the ETHGlobal New Delhi 2025