'use client';

import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { useState } from 'react';

export default function MyAssets() {
  const account = useCurrentAccount();
  const [showAssets, setShowAssets] = useState(false);

  const { data, isLoading } = useSuiClientQuery(
    'getOwnedObjects',
    {
      owner: account?.address || '',
      options: {
        showType: true,
        showContent: true,
      },
    },
    {
      enabled: !!account?.address && showAssets,
    }
  );

  if (!account) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">💼 My Assets</h2>
        <button
          onClick={() => setShowAssets(!showAssets)}
          className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors"
        >
          {showAssets ? '🔼 Hide' : '🔽 Show'}
        </button>
      </div>

      {showAssets && (
        <div className="space-y-2">
          {isLoading && (
            <p className="text-sm text-gray-600">Loading your assets...</p>
          )}

          {data && data.data.length === 0 && (
            <p className="text-sm text-gray-600">No assets found</p>
          )}

          {data && data.data.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.data.map((obj) => (
                <div
                  key={obj.data?.objectId}
                  className="p-3 bg-gray-50 rounded-md border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">Object ID:</p>
                      <p className="text-xs font-mono text-gray-800 truncate">
                        {obj.data?.objectId}
                      </p>
                      {obj.data?.type && (
                        <>
                          <p className="text-xs text-gray-500 mt-2 mb-1">Type:</p>
                          <p className="text-xs font-mono text-gray-700 break-all">
                            {obj.data.type}
                          </p>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(obj.data?.objectId || '');
                        alert('Object ID copied to clipboard!');
                      }}
                      className="ml-2 shrink-0 text-blue-600 hover:text-blue-800 text-xs"
                      title="Copy Object ID"
                    >
                      📋
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-500 mt-4">
            💡 Click the 📋 icon to copy an Object ID for use in the forms above
          </p>
        </div>
      )}
    </div>
  );
}
