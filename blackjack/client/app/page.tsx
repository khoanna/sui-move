'use client';

import useContract from "@/hook/useContract";
import { Game, GameStatus } from "@/type/Game";
import {ConnectButton, useCurrentAccount} from "@mysten/dapp-kit";
import { useEffect, useState } from "react";

export default function Home() {
  const account = useCurrentAccount();
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const {fetchCurrentGame, stand, hit, createGame, contractLoading} = useContract({address: account?.address, setCurrentGame});

  useEffect(() => {
    fetchCurrentGame();
  }, [account?.address]);

  const calculateTotal = (points: number[]) => {
    return points.reduce((sum, point) => sum + point, 0);
  };

  const getStatusText = (status: GameStatus) => {
    switch(status) {
      case GameStatus.PLAYER_WIN:
        return "🎉 Bạn thắng!";
      case GameStatus.DEALER_WIN:
        return "😢 Dealer thắng!";
      case GameStatus.DRAW:
        return "🤝 Hòa!";
      default:
        return "";
    }
  };

  const renderCard = (value: number, index: number) => {
    return (
      <div 
        key={index}
        className="card-3d"
        style={{
          animationDelay: `${index * 0.1}s`
        }}
      >
        <div className="card-inner">
          <div className="card-value">{value}</div>
          <div className="card-suit">♠</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-4xl">🃏</span>
            Blackjack
          </h1>
          <ConnectButton />
        </div>
      </div>

      {/* Main Game Area */}
      <div className="container mx-auto px-4 pt-24 pb-8">
        {!account ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
            <div className="bg-black/40 backdrop-blur-md rounded-3xl p-12 border border-white/20 shadow-2xl">
              <span className="text-7xl mb-6 block">🎰</span>
              <h2 className="text-3xl font-bold text-white mb-4">
                Chào mừng đến Blackjack!
              </h2>
              <p className="text-gray-300 text-lg mb-8">
                Vui lòng kết nối ví để bắt đầu chơi
              </p>
              <div className="flex justify-center">
                <ConnectButton />
              </div>
            </div>
          </div>
        ) : !currentGame ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <div className="bg-black/40 backdrop-blur-md rounded-3xl p-12 border border-white/20 shadow-2xl text-center">
              <span className="text-7xl mb-6 block">🎲</span>
              <h2 className="text-2xl font-bold text-white mb-4">
                Bắt đầu ván bài mới
              </h2>
              <p className="text-gray-300 mb-8">
                Mục tiêu: Đạt tổng điểm gần 21 nhất mà không vượt quá 21
              </p>
              <button
                onClick={createGame}
                disabled={contractLoading}
                className="game-button bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                {contractLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Đang tạo...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>🎮</span>
                    Ván mới
                  </span>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* Game Status Banner */}
            {currentGame.is_end && (
              <div className="mb-6 animate-bounce-in">
                <div className={`
                  text-center py-4 px-6 rounded-2xl font-bold text-2xl shadow-lg
                  ${currentGame.status === GameStatus.PLAYER_WIN ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 
                    currentGame.status === GameStatus.DEALER_WIN ? 'bg-gradient-to-r from-red-500 to-rose-500' : 
                    'bg-gradient-to-r from-blue-500 to-cyan-500'}
                `}>
                  {getStatusText(currentGame.status)}
                </div>
              </div>
            )}

            {/* Dealer Section */}
            <div className="mb-12">
              <div className="bg-black/40 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span>🤵</span>
                    Dealer
                  </h2>
                  <div className="score-badge bg-red-500">
                    {calculateTotal(currentGame.dealer_points)}
                  </div>
                </div>
                <div className="flex gap-4 flex-wrap justify-center">
                  {currentGame.dealer_points.map((point, index) => renderCard(point, index))}
                </div>
              </div>
            </div>

            {/* Player Section */}
            <div className="mb-8">
              <div className="bg-black/40 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span>👤</span>
                    Bạn
                  </h2>
                  <div className={`score-badge ${calculateTotal(currentGame.player_points) > 21 ? 'bg-red-500' : 'bg-blue-500'}`}>
                    {calculateTotal(currentGame.player_points)}
                  </div>
                </div>
                <div className="flex gap-4 flex-wrap justify-center">
                  {currentGame.player_points.map((point, index) => renderCard(point, index))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center flex-wrap">
              {!currentGame.is_end ? (
                <>
                  <button
                    onClick={() => hit(currentGame.id)}
                    disabled={contractLoading}
                    className="game-button bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    {contractLoading ? '⏳' : '👆'} Hit (Rút bài)
                  </button>
                  <button
                    onClick={() => stand(currentGame.id)}
                    disabled={contractLoading}
                    className="game-button bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {contractLoading ? '⏳' : '✋'} Stand (Dừng)
                  </button>
                </>
              ) : (
                <button
                  onClick={createGame}
                  disabled={contractLoading}
                  className="game-button bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                >
                  {contractLoading ? '⏳ Đang tạo...' : '🎮 Ván mới'}
                </button>
              )}
            </div>

            {/* Game Rules */}
            <div className="mt-12 bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-3">📜 Luật chơi:</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Mục tiêu: Đạt tổng điểm gần 21 nhất mà không vượt quá 21</li>
                <li>• <strong>Hit</strong>: Rút thêm bài</li>
                <li>• <strong>Stand</strong>: Dừng lại và để dealer chơi</li>
                <li>• Nếu vượt quá 21 điểm = thua (bust)</li>
                <li>• Dealer phải rút bài cho đến khi đạt ít nhất 17 điểm</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
