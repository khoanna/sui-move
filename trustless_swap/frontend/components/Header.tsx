'use client';

import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';

export default function Header() {
  const account = useCurrentAccount();

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🔄</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Trustless Swap</h1>
              <p className="text-sm text-gray-600">Atomic asset exchange on Sui</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {account && (
              <div className="hidden md:block text-right">
                <p className="text-xs text-gray-500">Connected as</p>
                <p className="text-sm font-mono text-gray-700">
                  {account.address.slice(0, 6)}...{account.address.slice(-4)}
                </p>
              </div>
            )}
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}
