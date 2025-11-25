import Header from "@/components/Header";
import Instructions from "@/components/Instructions";
import MyAssets from "@/components/MyAssets";
import LockAsset from "@/components/LockAsset";
import CreateEscrow from "@/components/CreateEscrow";
import ExecuteSwap from "@/components/ExecuteSwap";
import CancelEscrow from "@/components/CancelEscrow";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instructions Section */}
        <div className="mb-8">
          <Instructions />
        </div>

        {/* My Assets Section */}
        <MyAssets />

        {/* Main Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Lock Asset */}
          <LockAsset />

          {/* Create Escrow */}
          <CreateEscrow />

          {/* Execute Swap */}
          <ExecuteSwap />

          {/* Cancel Escrow */}
          <CancelEscrow />
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Need Help? 🤔
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Make sure to check the browser console for transaction details and object IDs after each action.
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <span>Built with Sui Move</span>
              <span>•</span>
              <span>@mysten/dapp-kit</span>
              <span>•</span>
              <span>Next.js 16</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
