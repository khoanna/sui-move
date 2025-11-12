"use client";

import useContract from "@/hooks/useContract";
import { Board } from "@/type/Board";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";

export default function Home() {
  const account = useCurrentAccount();
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [opponentAddress, setOpponentAddress] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const { fetchCurrentBoard, playGame, createBoard, contractLoading } = useContract(
    account?.address,
    setCurrentBoard
  );

  useEffect(() => {
    if (account?.address) {
      fetchCurrentBoard();
    }
  }, [account?.address]);

  const handlePlayMove = async (position: number) => {
    if (!currentBoard || !account?.address) return;

    // Check if it's user's turn
    if (currentBoard.next_player !== account.address) {
      alert("Chưa đến lượt của bạn!");
      return;
    }

    // Check if position is already taken
    const emptyAddress = "0x0000000000000000000000000000000000000000000000000000000000000000";
    if (currentBoard.game[position] !== emptyAddress) {
      alert("Ô này đã được đánh!");
      return;
    }

    await playGame(currentBoard.id, position);
  };

  const handleCreateBoard = async () => {
    if (!opponentAddress) {
      alert("Vui lòng nhập địa chỉ đối thủ!");
      return;
    }
    await createBoard(opponentAddress);
    setOpponentAddress("");
    setShowCreateForm(false);
  };

  const getCellSymbol = (cellAddress: string): string => {
    const emptyAddress = "0x0000000000000000000000000000000000000000000000000000000000000000";
    if (cellAddress === emptyAddress) return "";
    
    if (!currentBoard) return "";
    
    if (cellAddress === currentBoard.player[0]) return "X";
    if (cellAddress === currentBoard.player[1]) return "O";
    
    return "";
  };

  const getPlayerRole = (): string => {
    if (!currentBoard || !account?.address) return "";
    return currentBoard.player[0] === account.address ? "X" : "O";
  };

  const isMyTurn = (): boolean => {
    if (!currentBoard || !account?.address) return false;
    return currentBoard.next_player === account.address;
  };

  const getWinnerText = (): string => {
    if (!currentBoard || !currentBoard.ended) return "";
    
    if (currentBoard.winner === account?.address) {
      return "🎉 Bạn thắng!";
    } else if (currentBoard.winner === "0x0000000000000000000000000000000000000000000000000000000000000000") {
      return "🤝 Hòa!";
    } else {
      return "😢 Bạn thua!";
    }
  };

  // If not connected
  if (!account) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">🎮 Tic Tac Toe</h1>
          <p className="text-gray-600 mb-6">Kết nối ví để bắt đầu chơi</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  // If loading
  if (contractLoading && !currentBoard) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
            <p className="text-gray-700 text-lg">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  // If no board - show create form
  if (!currentBoard) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <ConnectButton />
        </div>
        
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            🎮 Tạo Bàn Chơi Mới
          </h1>
          
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition duration-200 transform hover:scale-105"
            >
              Tạo Game Mới
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ đối thủ
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={opponentAddress}
                  onChange={(e) => setOpponentAddress(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleCreateBoard}
                  disabled={contractLoading || !opponentAddress}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-4 rounded-xl transition duration-200 disabled:cursor-not-allowed"
                >
                  {contractLoading ? "Đang tạo..." : "Tạo"}
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition duration-200"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-6 text-center">
            Bạn chưa có bàn chơi nào. Tạo bàn mới để bắt đầu!
          </p>
        </div>
      </div>
    );
  }

  // Game board UI
  return (
    <div className="min-h-screen bg-linear-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ConnectButton />
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">
          🎮 Tic Tac Toe
        </h1>

        {/* Game Status */}
        <div className="mb-6 text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg text-gray-700">Bạn là:</span>
            <span className="text-3xl font-bold text-purple-600">{getPlayerRole()}</span>
          </div>
          
          {currentBoard.ended ? (
            <div className="text-3xl font-bold animate-bounce">
              {getWinnerText()}
            </div>
          ) : (
            <div className={`text-xl font-semibold ${isMyTurn() ? "text-green-600" : "text-orange-600"}`}>
              {isMyTurn() ? "🟢 Đến lượt bạn!" : "🟠 Đợi đối thủ..."}
            </div>
          )}
        </div>

        {/* Game Board Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6 aspect-square max-w-md mx-auto">
          {currentBoard.game.map((cell, index) => {
            const symbol = getCellSymbol(cell);
            const isEmpty = symbol === "";
            const canClick = isEmpty && isMyTurn() && !currentBoard.ended && !contractLoading;

            return (
              <button
                key={index}
                onClick={() => canClick && handlePlayMove(index)}
                disabled={!canClick}
                className={`
                  aspect-square text-5xl font-bold rounded-xl
                  transition-all duration-200 transform
                  ${isEmpty ? "bg-gray-100 hover:bg-gray-200" : "bg-linear-to-br from-purple-100 to-pink-100"}
                  ${canClick ? "hover:scale-105 cursor-pointer hover:shadow-lg" : "cursor-not-allowed"}
                  ${symbol === "X" ? "text-purple-600" : "text-pink-600"}
                  border-4 border-gray-300
                  flex items-center justify-center
                `}
              >
                {contractLoading && isEmpty ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                ) : (
                  symbol
                )}
              </button>
            );
          })}
        </div>

        {/* Player Info */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl border-2 border-purple-200">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-purple-600">X</span>
              <span className="font-medium text-gray-700">Player 1</span>
            </div>
            <span className="text-xs text-gray-600 font-mono">
              {currentBoard.player[0]?.slice(0, 6)}...{currentBoard.player[0]?.slice(-4)}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-pink-50 rounded-xl border-2 border-pink-200">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-pink-600">O</span>
              <span className="font-medium text-gray-700">Player 2</span>
            </div>
            <span className="text-xs text-gray-600 font-mono">
              {currentBoard.player[1]?.slice(0, 6)}...{currentBoard.player[1]?.slice(-4)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={fetchCurrentBoard}
            disabled={contractLoading}
            className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-xl transition duration-200 disabled:cursor-not-allowed"
          >
            🔄 Làm mới
          </button>
          
          {currentBoard.ended && (
            <button
              onClick={() => {
                setCurrentBoard(null);
                setShowCreateForm(true);
              }}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-xl transition duration-200"
            >
              🎮 Game Mới
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
