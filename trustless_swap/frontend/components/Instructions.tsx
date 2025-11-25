export default function Instructions() {
  return (
    <div className="bg-linear-to-r from-blue-50 to-purple-50 rounded-lg shadow-md p-6 border border-blue-100">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">📖 How It Works</h2>
      
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
            1
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">Alice Locks Her Asset 🔒</h3>
            <p className="text-sm text-gray-600">
              Alice locks her asset (e.g., 100 SUI) and receives a <strong>Lock</strong> and <strong>Key</strong>. 
              She shares the <strong>Key ID</strong> with Bob.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
            2
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">Bob Creates Escrow 📦</h3>
            <p className="text-sm text-gray-600">
              Bob creates an escrow with his asset (e.g., 50 SUI), referencing Alice's <strong>Key ID</strong> 
              and setting Alice as the receiver. The escrow is now publicly visible on-chain.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
            3
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">Alice Executes the Swap 🔄</h3>
            <p className="text-sm text-gray-600">
              Alice uses her <strong>Key</strong>, Bob's <strong>Lock</strong>, and the <strong>Escrow</strong> 
              to execute the swap. Both assets are exchanged atomically - Alice gets Bob's asset, Bob gets Alice's asset.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
            ⚠️
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">Alternative: Cancel Escrow ❌</h3>
            <p className="text-sm text-gray-600">
              Bob can cancel his escrow before Alice executes the swap to get his asset back. 
              Only the escrow creator can cancel.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-white rounded-md border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-2">✨ Key Features:</h4>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li><strong>Trustless:</strong> No need for a trusted third party</li>
          <li><strong>Atomic:</strong> Either both parties get their assets, or nobody does</li>
          <li><strong>Secure:</strong> Cryptographic verification ensures only the right parties can execute</li>
          <li><strong>Generic:</strong> Works with any asset type on Sui</li>
        </ul>
      </div>
    </div>
  );
}
