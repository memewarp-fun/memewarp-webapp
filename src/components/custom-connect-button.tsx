"use client";

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from "@/components/ui/button";
import { ChevronDown, Wallet, LogOut, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';

export const CustomConnectButton = () => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Wrong network
                  </Button>
                );
              }

              return (
                <div className="relative">
                  <Button
                    onClick={() => setShowAccountMenu(!showAccountMenu)}
                    className="bg-green-500 hover:bg-green-600 text-black font-semibold"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {account.displayName}
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ''}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>

                  {showAccountMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-zinc-900 rounded-lg border border-zinc-800 shadow-lg overflow-hidden z-50">
                      <div className="p-4 border-b border-zinc-800">
                        <p className="text-sm text-gray-400">Connected to</p>
                        <p className="font-semibold">{chain.name}</p>
                      </div>

                      <div className="p-2">
                        <div className="mb-2">
                          <p className="text-xs text-gray-500 uppercase px-3 py-1">Switch Chain</p>
                          <button
                            onClick={openChainModal}
                            className={`w-full px-3 py-2 text-left hover:bg-zinc-800 rounded flex items-center gap-2 text-sm ${chain.id === 747 ? 'bg-zinc-800' : ''}`}
                          >
                            <img src="/flow-logo.png" alt="Flow" className="w-5 h-5" />
                            Flow
                            {chain.id === 747 && <span className="ml-auto text-green-500">✓</span>}
                          </button>
                          <button
                            onClick={openChainModal}
                            className={`w-full px-3 py-2 text-left hover:bg-zinc-800 rounded flex items-center gap-2 text-sm ${chain.id === 295 ? 'bg-zinc-800' : ''}`}
                          >
                            <img src="/hedera-logo.png" alt="Hedera" className="w-5 h-5" />
                            Hedera
                            {chain.id === 295 && <span className="ml-auto text-green-500">✓</span>}
                          </button>
                        </div>

                        <hr className="my-2 border-zinc-800" />

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(account.address);
                            // You could add a toast notification here
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-zinc-800 rounded flex items-center gap-2 text-sm"
                        >
                          <Copy className="w-4 h-4" />
                          Copy Address
                        </button>

                        <button
                          onClick={openAccountModal}
                          className="w-full px-3 py-2 text-left hover:bg-zinc-800 rounded flex items-center gap-2 text-sm"
                        >
                          <Wallet className="w-4 h-4" />
                          Account Details
                        </button>

                        {chain?.id && (
                          <a
                            href={`${chain.id === 747 ? 'https://evm.flowscan.io' : 'https://hashscan.io/mainnet'}/address/${account.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full px-3 py-2 text-left hover:bg-zinc-800 rounded flex items-center gap-2 text-sm block"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View on Explorer
                          </a>
                        )}

                        <button
                          onClick={() => {
                            openAccountModal();
                            setShowAccountMenu(false);
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
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};