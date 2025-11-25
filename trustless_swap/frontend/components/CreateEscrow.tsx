'use client';

import { useState } from 'react';
import useContract from '@/hook/useContract';
import { useCurrentAccount } from '@mysten/dapp-kit';

export default function CreateEscrow() {
  const account = useCurrentAccount();
  const { createEscrow, transactionLoading } = useContract(account?.address || '');
  const [assetId, setAssetId] = useState('');
  const [assetType, setAssetType] = useState('0x2::coin::Coin<0x2::sui::SUI>');
  const [exchangeKey, setExchangeKey] = useState('');
  const [receiver, setReceiver] = useState('');
  const [showExamples, setShowExamples] = useState(false);

  const handleCreateEscrow = async () => {
    if (!assetId.trim() || !exchangeKey.trim() || !receiver.trim()) {
      alert('Please fill in all fields');
      return;
    }

    await createEscrow({
      assetType,
      assetId: assetId.trim(),
      exchangeKey: exchangeKey.trim(),
      receiver: receiver.trim(),
    });
  };

  if (!account) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">📦 Step 2: Create Escrow</h2>
        <p className="text-gray-600">Please connect your wallet to continue.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">📦 Step 2: Create Escrow</h2>
      <p className="text-sm text-gray-600 mb-4">
        Create an escrow with your asset. Reference the Key ID from the other party.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Asset Type
            <button
              type="button"
              onClick={() => setShowExamples(!showExamples)}
              className="ml-2 text-xs text-blue-600 hover:text-blue-800"
            >
              {showExamples ? '▼ Hide examples' : '▶ Show examples'}
            </button>
          </label>
          <input
            type="text"
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
            placeholder="e.g., 0x2::coin::Coin<0x2::sui::SUI>"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
          />
          {showExamples && (
            <div className="mt-2 p-3 bg-gray-50 rounded text-xs space-y-2">
              <div>
                <p className="font-semibold text-gray-700">SUI Coin:</p>
                <button
                  type="button"
                  onClick={() => setAssetType('0x2::coin::Coin<0x2::sui::SUI>')}
                  className="text-blue-600 hover:underline break-all text-left"
                >
                  0x2::coin::Coin&lt;0x2::sui::SUI&gt;
                </button>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Walrus (WAL) Coin:</p>
                <button
                  type="button"
                  onClick={() => setAssetType('0x2::coin::Coin<0x8270feb7375eee355e64fdb69c50abb6b5f9393a722883c1cf45f8e26048810a::wal::WAL>')}
                  className="text-blue-600 hover:underline break-all text-left"
                >
                  0x2::coin::Coin&lt;0x8270feb7375eee355e64fdb69c50abb6b5f9393a722883c1cf45f8e26048810a::wal::WAL&gt;
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Asset Object ID
          </label>
          <input
            type="text"
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Exchange Key ID (from other party)
          </label>
          <input
            type="text"
            value={exchangeKey}
            onChange={(e) => setExchangeKey(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Receiver Address (who will execute the swap)
          </label>
          <input
            type="text"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
          />
        </div>

        <button
          onClick={handleCreateEscrow}
          disabled={transactionLoading || !assetId.trim() || !exchangeKey.trim() || !receiver.trim()}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {transactionLoading ? '🔄 Creating...' : '📦 Create Escrow'}
        </button>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>💡 Note:</strong> The exchange key should be the Key ID that the other party 
            shared with you after locking their asset. The receiver is the person who will complete the swap.
          </p>
        </div>
      </div>
    </div>
  );
}
