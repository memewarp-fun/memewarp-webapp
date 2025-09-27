"use client";

import { useAccount, useConnect, useDisconnect, useEnsName, useEnsAvatar } from 'wagmi';
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { ChevronDown, Wallet, LogOut, Copy, ExternalLink } from 'lucide-react';

export function ConnectWallet() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const [showDropdown, setShowDropdown] = useState(false);
  const [showConnectors, setShowConnectors] = useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      // You could add a toast notification here
    }
  };

  if (isConnected && address) {
    return (
      <div className="relative">
        <Button
          onClick={() => setShowDropdown(!showDropdown)}
          className="bg-green-500 hover:bg-green-600 text-black font-semibold"
        >
          <Wallet className="w-4 h-4 mr-2" />
          {ensName || formatAddress(address)}
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-64 bg-zinc-900 rounded-lg border border-zinc-800 shadow-lg overflow-hidden z-50">
            <div className="p-4 border-b border-zinc-800">
              <p className="text-sm text-gray-400">Connected to</p>
              <p className="font-semibold">{chain?.name || 'Unknown Network'}</p>
            </div>

            <div className="p-2">
              <button
                onClick={copyAddress}
                className="w-full px-3 py-2 text-left hover:bg-zinc-800 rounded flex items-center gap-2 text-sm"
              >
                <Copy className="w-4 h-4" />
                Copy Address
              </button>

              <a
                href={chain?.blockExplorers?.default.url + '/address/' + address}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-3 py-2 text-left hover:bg-zinc-800 rounded flex items-center gap-2 text-sm block"
              >
                <ExternalLink className="w-4 h-4" />
                View on Explorer
              </a>

              <button
                onClick={() => {
                  disconnect();
                  setShowDropdown(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-zinc-800 rounded flex items-center gap-2 text-sm text-red-500"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setShowConnectors(!showConnectors)}
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
        disabled={isPending}
      >
        {isPending ? 'Connecting...' : 'Connect Wallet'}
      </Button>

      {showConnectors && (
        <div className="absolute right-0 mt-2 w-64 bg-zinc-900 rounded-lg border border-zinc-800 shadow-lg overflow-hidden z-50">
          <div className="p-4 border-b border-zinc-800">
            <p className="font-semibold">Choose Wallet</p>
          </div>
          <div className="p-2">
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => {
                  connect({ connector });
                  setShowConnectors(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-zinc-800 rounded flex items-center gap-2 text-sm"
                disabled={isPending}
              >
                <Wallet className="w-4 h-4" />
                {connector.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-full mt-2 right-0 bg-red-500/20 border border-red-500 rounded-lg px-3 py-2 text-sm text-red-500">
          {error.message}
        </div>
      )}
    </div>
  );
}