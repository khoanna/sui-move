'use client';

import useContract from "@/services/useContract";
import { ConnectButton, useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useState, useEffect } from "react";



export default function Home() {
  const account = useCurrentAccount();
  
  const [counterValue, setCounterValue] = useState<number>(0);
  const{ handleIncrement, handleDecrement, fetchCounter, transactionLoading } = useContract({ setCounterValue });

  useEffect(() => {
    if (account) {
      fetchCounter();
    }
  }, [account]);


  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Counter DApp</h1>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Counter DApp</h1>
          <ConnectButton />
        </div>

        <div className="max-w-md mx-auto mt-20">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <p className="text-gray-600 mb-2">Counter Value</p>
              <div className="text-6xl font-bold text-indigo-600">
                {counterValue}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleDecrement}
                disabled={transactionLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 text-lg"
              >
                {transactionLoading ? "Processing..." : "Decrease"}
              </button>
              <button
                onClick={handleIncrement}
                disabled={transactionLoading}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 text-lg"
              >
                {transactionLoading ? "Processing..." : "Increase"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
