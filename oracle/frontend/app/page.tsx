"use client";

import { useState, useEffect } from "react";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { ADMIN_ADDRESS } from "@/lib/constant";
import useOracle from "@/hook/useOracle";
import CreateOracleModal from "@/components/CreateOracleModal";
import OracleList from "@/components/OracleList";
import UserPointsDisplay from "@/components/UserPointsDisplay";
import { Oracle } from "@/type/Oracle";

export default function Home() {
  const account = useCurrentAccount();
  const { getOracles } = useOracle();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [oracles, setOracles] = useState<Oracle[]>([]);
  const [isLoadingOracles, setIsLoadingOracles] = useState(false);

  const isAdmin = account?.address === ADMIN_ADDRESS;

  const loadOracles = async () => {
    setIsLoadingOracles(true);
    try {
      const data = await getOracles();
      setOracles(data);
    } catch (error) {
      console.error("Failed to load oracles:", error);
    } finally {
      setIsLoadingOracles(false);
    }
  };

  useEffect(() => {
    loadOracles();
  }, []);

  const handleOracleCreated = () => {
    loadOracles();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-linear-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Weather Oracle
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Predict. Compete. Win.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {account && <UserPointsDisplay />}
              {isAdmin && account && (
                <div className="relative group">
                  <div className="absolute inset-0 bg-linear-to-r from-amber-500 to-orange-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative bg-linear-to-r from-amber-500 to-orange-500 text-white rounded-xl px-5 py-2.5 shadow-lg hover:shadow-xl transition-all">
                    <div className="flex items-center gap-2">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1.5">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.991 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.58V12a1 1 0 11-2 0v-1.42l-1.246-.712a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.42l1.246.712a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.42V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-white/80 uppercase tracking-wide">Role</div>
                        <div className="text-sm font-bold leading-tight">Admin</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!account ? (
          // Not Connected State
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-r from-blue-600 to-purple-600 mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Connect Your Wallet
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Connect your wallet to start predicting weather and earning rewards
              </p>
              <ConnectButton />
            </div>
          </div>
        ) : (
          <>
            {/* Action Bar */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    Active Oracles
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {oracles.length} {oracles.length === 1 ? 'oracle' : 'oracles'} available
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={loadOracles}
                    disabled={isLoadingOracles}
                    className="px-4 py-2.5 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition-all flex items-center gap-2"
                  >
                    <svg 
                      className={`w-5 h-5 ${isLoadingOracles ? 'animate-spin' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Oracle
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Oracle List */}
            <OracleList oracles={oracles} isLoading={isLoadingOracles} onRefresh={loadOracles} />
          </>
        )}
      </main>

      {/* Create Oracle Modal */}
      {isAdmin && (
        <CreateOracleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleOracleCreated}
        />
      )}
    </div>
  );
}
