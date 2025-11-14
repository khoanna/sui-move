"use client";

import { useEffect, useState } from "react";
import useContract from "@/hook/useContract";
import { useCurrentAccount } from "@mysten/dapp-kit";

export default function UserPointsDisplay() {
  const account = useCurrentAccount();
  const { fetchUserPoint, contractLoading } = useContract({ address: account?.address });
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const loadPoints = async () => {
    if (!account?.address) return;
    
    setLoading(true);
    try {
      const userPoints = await fetchUserPoint();
      setPoints(userPoints || 0);
    } catch (error) {
      console.error("Failed to load points:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPoints();
  }, [account?.address]);

  if (!account) return null;

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-linear-to-r from-amber-500 to-orange-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
      <div className="relative bg-linear-to-r from-amber-500 to-orange-500 text-white rounded-xl px-5 py-2.5 shadow-lg hover:shadow-xl transition-all">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-medium text-white/80 uppercase tracking-wide">Points</div>
            <div className="text-xl font-bold leading-tight">
              {loading || contractLoading ? (
                <div className="animate-pulse bg-white/20 h-6 w-12 rounded"></div>
              ) : (
                <span className="tabular-nums">{points}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
