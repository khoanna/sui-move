'use client';

import { useState } from 'react';
import useContract from '@/hook/useContract';
import { useCurrentAccount } from '@mysten/dapp-kit';

export default function CancelEscrow() {
  const account = useCurrentAccount();
  const { cancelEscrow, transactionLoading } = useContract(account?.address || '');
  const [escrowId, setEscrowId] = useState('');
  const [escrowAssetType, setEscrowAssetType] = useState('0x2::coin::Coin<0x2::sui::SUI>');

  const handleCancel = async () => {
    if (!escrowId.trim()) {
      alert('Please enter an escrow ID');
      return;
    }

    const confirmed = confirm('Are you sure you want to cancel this escrow? This action cannot be undone.');
    if (!confirmed) return;

    await cancelEscrow({
      escrowAssetType,
      escrowId: escrowId.trim(),
    });
  };

  if (!account) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">❌ Cancel Escrow</h2>
        <p className="text-gray-600">Please connect your wallet to continue.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">❌ Cancel Escrow</h2>
      <p className="text-sm text-gray-600 mb-4">
        Cancel your escrow if the swap hasn't been completed yet. You'll get your asset back.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Asset Type
          </label>
          <input
            type="text"
            value={escrowAssetType}
            onChange={(e) => setEscrowAssetType(e.target.value)}
            placeholder="e.g., 0x2::coin::Coin<0x2::sui::SUI>"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800"
          />
        </div>

        <button
          onClick={handleCancel}
          disabled={transactionLoading || !escrowId.trim()}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {transactionLoading ? '🔄 Canceling...' : '❌ Cancel Escrow'}
        </button>

        <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-md">
          <p className="text-sm text-orange-800">
            <strong>⚠️ Warning:</strong> You can only cancel an escrow if you're the original creator 
            and the swap hasn't been executed yet. Once canceled, your asset will be returned to you.
          </p>
        </div>
      </div>
    </div>
  );
}
