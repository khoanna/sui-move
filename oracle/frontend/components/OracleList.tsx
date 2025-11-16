"use client";

import { Oracle, EnrichedOracle } from "@/type/Oracle";
import { useState, useEffect } from "react";
import useContract from "@/hook/useContract";
import { useCurrentAccount } from "@mysten/dapp-kit";

interface OracleListProps {
  oracles: Oracle[];
  isLoading: boolean;
  onRefresh: () => void;
}

export default function OracleList({ oracles, isLoading, onRefresh }: OracleListProps) {
  const account = useCurrentAccount();
  const { fetchOracleData, fetchUserPrediction, predict, claimPoint, contractLoading } = useContract({ address: account?.address });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [enrichedOracles, setEnrichedOracles] = useState<EnrichedOracle[]>([]);
  const [loadingOracles, setLoadingOracles] = useState(false);

  // Fetch blockchain data for all oracles
  useEffect(() => {
    const enrichOraclesData = async () => {
      if (!oracles.length || !account?.address) {
        setEnrichedOracles(oracles);
        return;
      }

      setLoadingOracles(true);
      try {
        const enriched = await Promise.all(
          oracles.map(async (oracle) => {
            try {
              const [oracleData, userPrediction] = await Promise.all([
                fetchOracleData(oracle.id),
                fetchUserPrediction(oracle.predict_id)
              ]);

              return {
                ...oracle,
                city: oracleData?.city,
                temperature: oracleData?.temperature,
                target_temp: oracleData?.target_temp,
                target_time: oracleData?.target_time,
                ended: oracleData?.ended,
                current_temp: oracleData?.temperature,
                user_prediction: userPrediction,
              } as EnrichedOracle;
            } catch (error) {
              console.error(`Failed to enrich oracle ${oracle.id}:`, error);
              return oracle as EnrichedOracle;
            }
          })
        );
        setEnrichedOracles(enriched);
      } catch (error) {
        console.error("Failed to enrich oracles:", error);
        setEnrichedOracles(oracles as EnrichedOracle[]);
      } finally {
        setLoadingOracles(false);
      }
    };

    enrichOraclesData();
  }, [oracles, account?.address]);

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    const now = Date.now();
    const diff = timestamp - now;
    
    if (diff < 0) return "Expired";
    
    const days = Math.floor(diff / (1000 * 86400));
    const hours = Math.floor((diff % (1000 * 86400)) / (1000 * 3600));
    const minutes = Math.floor((diff % (1000 * 3600)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const isExpired = (timestamp?: number) => {
    if (!timestamp) return false;
    return timestamp < Date.now();
  };

  const handlePredict = async (oracle: EnrichedOracle, prediction: boolean) => {
    if (!account?.address) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      await predict(oracle.id, oracle.predict_id, prediction);
      
      setEnrichedOracles(prevOracles => 
        prevOracles.map(o => 
          o.id === oracle.id 
            ? { ...o, user_prediction: prediction } 
            : o
        )
      );
      
      
      // Also refresh from backend
      onRefresh();
    } catch (error) {
      console.error("Failed to make prediction:", error);
    }
  };

  const handleClaim = async (oracle: EnrichedOracle) => {
    if (!account?.address) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      await claimPoint(oracle.predict_id, oracle.id);
      
      // Refresh to update points and oracle status
      onRefresh();
    } catch (error) {
      console.error("Failed to claim points:", error);
    }
  };

  const convertTemperature = (temp?: number) => {
    if (temp === undefined || temp === null) return "N/A";
    return (temp / 1000).toFixed(1);
  };

  if (isLoading || loadingOracles) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200 dark:border-gray-800">
              <div className="h-32 bg-linear-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800"></div>
              <div className="p-6 space-y-4">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (oracles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-linear-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 mb-6">
          <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          No Active Oracles
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
          There are no weather oracles available right now. Check back later or create a new one!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {enrichedOracles.map((oracle) => {
        const expired = isExpired(oracle.target_time);
        const expanded = expandedId === oracle.id;
        const hasPredicted = oracle.user_prediction !== null && oracle.user_prediction !== undefined;
        const canClaim = oracle.ended && hasPredicted;

        return (
          <div
            key={oracle.id}
            className={`group bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${
              expired 
                ? 'border-gray-300 dark:border-gray-700' 
                : 'border-transparent hover:border-blue-300 dark:hover:border-blue-700'
            }`}
          >
            {/* Header */}
            <div className={`relative p-6 ${
              expired 
                ? 'bg-linear-to-r from-gray-500 to-gray-600' 
                : 'bg-linear-to-r from-blue-500 via-purple-500 to-purple-600'
            }`}>
              {!expired && (
                <div className="absolute inset-0 bg-linear-to-r from-blue-400/0 via-white/10 to-purple-400/0 opacity-50"></div>
              )}
              <div className="relative flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1 truncate">
                    {oracle.city || "Loading..."}
                  </h3>
                  {oracle.latitude && oracle.longitude && (
                    <div className="flex items-center gap-2 text-white/90 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">
                        {oracle.latitude.toFixed(2)}, {oracle.longitude.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 text-white font-bold text-lg">
                    {oracle.target_temp ? convertTemperature(oracle.target_temp) : "N/A"}°C
                  </div>
                  {oracle.current_temp !== undefined && (
                    <div className="bg-green-500/30 backdrop-blur-sm rounded-lg px-3 py-1 text-white text-sm font-semibold">
                      Now: {convertTemperature(oracle.current_temp)}°C
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Time Info */}
              <div className="mb-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formatDate(oracle.target_time)}</span>
                </div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                  expired 
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' 
                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${expired ? 'bg-gray-400' : 'bg-green-500 animate-pulse'}`}></div>
                  {getTimeRemaining(oracle.target_time)}
                </div>
              </div>

              {/* IDs Section - Expandable */}
              <div className="border-t-2 border-gray-100 dark:border-gray-800 pt-4">
                <button
                  onClick={() => setExpandedId(expanded ? null : oracle.id)}
                  className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <span>Oracle Details</span>
                  <svg 
                    className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expanded && (
                  <div className="mt-3 space-y-2 animate-slide-down">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        Oracle ID
                      </div>
                      <div className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                        {oracle.id}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        Prediction ID
                      </div>
                      <div className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                        {oracle.predict_id}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {!hasPredicted && !expired && (
                  <div className="mt-4 space-y-3">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      Make Your Prediction
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handlePredict(oracle, true)}
                        disabled={contractLoading || loadingOracles}
                        className="group relative px-4 py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden shadow-md hover:shadow-lg active:scale-95"
                      >
                        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        <span className="relative z-10">Higher</span>
                      </button>
                      <button
                        onClick={() => handlePredict(oracle, false)}
                        disabled={contractLoading || loadingOracles}
                        className="group relative px-4 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden shadow-md hover:shadow-lg active:scale-95"
                      >
                        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        <span className="relative z-10">Lower</span>
                      </button>
                    </div>
                  </div>
                )}

                {hasPredicted && !oracle.ended && (
                  <div className="mt-4 px-4 py-4 bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                      <div className="text-sm font-bold text-blue-900 dark:text-blue-100">
                        Your Prediction: {oracle.user_prediction ? "📈 Higher" : "📉 Lower"}
                      </div>
                    </div>
                    <div className="text-xs text-center text-blue-700 dark:text-blue-300">
                      Waiting for oracle to end...
                    </div>
                  </div>
                )}

                {canClaim && (
                  <button
                    onClick={() => handleClaim(oracle)}
                    disabled={contractLoading || loadingOracles}
                    className="mt-4 w-full group relative px-4 py-4 bg-linear-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl overflow-hidden active:scale-95"
                  >
                    <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                    <svg className="w-6 h-6 relative z-10 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="relative z-10 text-lg">Claim Your Points!</span>
                  </button>
                )}

                {expired && !hasPredicted && (
                  <div className="mt-4 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-center border-2 border-gray-300 dark:border-gray-700">
                    <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 font-semibold">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Oracle Expired
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
