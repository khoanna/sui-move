'use client';

import { useState } from 'react';
import useContract from '@/hook/useContract';
import { useCurrentAccount } from '@mysten/dapp-kit';

export default function LockAsset() {
  const account = useCurrentAccount();
  const { lockAsset, transactionLoading } = useContract(account?.address || '');
  const [assetId, setAssetId] = useState('');
  const [assetType, setAssetType] = useState('0x2::coin::Coin<0x2::sui::SUI>');
  const [showExamples, setShowExamples] = useState(false);

  const handleLock = async () => {
    if (!assetId.trim()) {
      alert('Please enter an asset ID');
      return;
    }
    
    await lockAsset({
      typeAsset: assetType,
      assetId: assetId.trim(),
    });
  };

  if (!account) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">🔒 Step 1: Lock Your Asset</h2>
        <p className="text-gray-600">Please connect your wallet to continue.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">🔒 Step 1: Lock Your Asset</h2>
      <p className="text-sm text-gray-600 mb-4">
        Lock your asset to generate a Lock and Key pair. Share the Key ID with the other party.
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
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
              <p className="text-gray-600 italic mt-2">
                ⚠️ Important: For coins/tokens, always wrap the type in <code>0x2::coin::Coin&lt;...&gt;</code>
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Asset Object ID
          </label>
          <input
            type="text"
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          />
        </div>

        <button
          onClick={handleLock}
          disabled={transactionLoading || !assetId.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {transactionLoading ? '🔄 Locking...' : '🔒 Lock Asset'}
        </button>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>💡 Note:</strong> After locking, you'll receive a Lock object and a Key object. 
            Copy the Key ID and share it with the person you want to swap with.
          </p>
        </div>
      </div>
    </div>
  );
}
