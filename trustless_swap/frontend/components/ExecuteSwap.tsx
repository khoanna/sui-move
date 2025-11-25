'use client';

import { useState } from 'react';
import useContract from '@/hook/useContract';
import { useCurrentAccount } from '@mysten/dapp-kit';

export default function ExecuteSwap() {
  const account = useCurrentAccount();
  const { acceptEscrow, transactionLoading } = useContract(account?.address || '');
  const [escrowId, setEscrowId] = useState('');
  const [keyId, setKeyId] = useState('');
  const [lockId, setLockId] = useState('');
  const [escrowAssetType, setEscrowAssetType] = useState('0x2::coin::Coin<0x2::sui::SUI>');
  const [lockedAssetType, setLockedAssetType] = useState('0x2::coin::Coin<0x2::sui::SUI>');

  const handleSwap = async () => {
    if (!escrowId.trim() || !keyId.trim() || !lockId.trim()) {
      alert('Please fill in all fields');
      return;
    }

    await acceptEscrow({
      escrowAssetType,
      lockedAssetType,
      escrowId: escrowId.trim(),
      keyId: keyId.trim(),
      lockId: lockId.trim(),
    });
  };

  if (!account) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">🔄 Step 3: Execute Swap</h2>
        <p className="text-gray-600">Please connect your wallet to continue.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">🔄 Step 3: Execute Swap</h2>
      <p className="text-sm text-gray-600 mb-4">
        Complete the atomic swap by providing the Escrow, your Key, and the Lock from the other party.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Escrow Asset Type
          </label>
          <input
            type="text"
            value={escrowAssetType}
            onChange={(e) => setEscrowAssetType(e.target.value)}
            placeholder="e.g., 0x2::coin::Coin<0x2::sui::SUI>"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Locked Asset Type
          </label>
          <input
            type="text"
            value={lockedAssetType}
            onChange={(e) => setLockedAssetType(e.target.value)}
            placeholder="e.g., 0x2::coin::Coin<0x2::sui::SUI>"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Escrow Object ID
          </label>
          <input
            type="text"
            value={escrowId}
            onChange={(e) => setEscrowId(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Key Object ID
          </label>
          <input
            type="text"
            value={keyId}
            onChange={(e) => setKeyId(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lock Object ID (from other party)
          </label>
          <input
            type="text"
            value={lockId}
            onChange={(e) => setLockId(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
          />
        </div>

        <button
          onClick={handleSwap}
          disabled={transactionLoading || !escrowId.trim() || !keyId.trim() || !lockId.trim()}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {transactionLoading ? '🔄 Swapping...' : '✨ Execute Swap'}
        </button>

        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            <strong>💡 Note:</strong> This will atomically exchange the assets. You'll receive the 
            asset from the escrow, and the other party will receive your locked asset. The swap is irreversible!
          </p>
        </div>
      </div>
    </div>
  );
}
