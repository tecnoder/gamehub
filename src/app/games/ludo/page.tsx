'use client';

import { useState } from 'react';
import GameLayout from '@/components/games/GameLayout';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

// Ludo game state type
type LudoGameState = {
  board: number[][];
  currentPlayer: 'red' | 'green' | 'yellow' | 'blue';
  diceValue: number;
  playerPieces: {
    red: { position: number, isHome: boolean, isComplete: boolean }[];
    green: { position: number, isHome: boolean, isComplete: boolean }[];
    yellow: { position: number, isHome: boolean, isComplete: boolean }[];
    blue: { position: number, isHome: boolean, isComplete: boolean }[];
  };
  gameStatus: 'waiting' | 'playing' | 'finished';
  winner: string | null;
};

// Initial game state
const initialGameState: LudoGameState = {
  board: Array(15).fill(Array(15).fill(0)),
  currentPlayer: 'red',
  diceValue: 0,
  playerPieces: {
    red: Array(4).fill({ position: 0, isHome: true, isComplete: false }),
    green: Array(4).fill({ position: 0, isHome: true, isComplete: false }),
    yellow: Array(4).fill({ position: 0, isHome: true, isComplete: false }),
    blue: Array(4).fill({ position: 0, isHome: true, isComplete: false }),
  },
  gameStatus: 'waiting',
  winner: null,
};

// Player colors
const playerColors = {
  red: 'bg-red-600',
  green: 'bg-green-600',
  yellow: 'bg-yellow-500',
  blue: 'bg-blue-600',
};

export default function LudoGame() {
  const [gameState, setGameState] = useState<LudoGameState>(initialGameState);
  const [showHelp, setShowHelp] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  // Roll the dice
  const rollDice = () => {
    if (gameState.gameStatus === 'finished' || isRolling) return;
    
    setIsRolling(true);
    
    // Simulate dice roll animation
    const rollInterval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        diceValue: Math.floor(Math.random() * 6) + 1
      }));
    }, 100);
    
    // Stop rolling after 1 second
    setTimeout(() => {
      clearInterval(rollInterval);
      setIsRolling(false);
      
      // Set final dice value
      const finalValue = Math.floor(Math.random() * 6) + 1;
      setGameState(prev => ({
        ...prev,
        diceValue: finalValue,
        gameStatus: 'playing'
      }));
      
      // In a real game, we would check if the player can move and handle turns
    }, 1000);
  };

  // Start a new game
  const startNewGame = () => {
    setGameState(initialGameState);
  };

  // Render the Ludo board (simplified version)
  const renderBoard = () => {
    return (
      <div className="aspect-square w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-3 h-full">
          {/* Red home (top-left) */}
          <div className="bg-red-100 border-r-2 border-b-2 border-gray-800 flex items-center justify-center">
            <div className="w-3/4 h-3/4 bg-red-600 rounded-lg flex flex-wrap items-center justify-center p-2">
              {[0, 1, 2, 3].map(i => (
                <div key={`red-${i}`} className="w-1/3 h-1/3 flex items-center justify-center">
                  <div className="w-5/6 h-5/6 rounded-full bg-white shadow-inner"></div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Green path (top) */}
          <div className="bg-gray-100 border-b-2 border-gray-800 flex items-center justify-center">
            <div className="w-full h-full grid grid-cols-5 grid-rows-3">
              {Array(15).fill(0).map((_, i) => (
                <div key={`top-${i}`} className="border border-gray-300 flex items-center justify-center">
                  {i === 7 && <div className="w-3/4 h-3/4 bg-green-600 transform rotate-45"></div>}
                </div>
              ))}
            </div>
          </div>
          
          {/* Green home (top-right) */}
          <div className="bg-green-100 border-l-2 border-b-2 border-gray-800 flex items-center justify-center">
            <div className="w-3/4 h-3/4 bg-green-600 rounded-lg flex flex-wrap items-center justify-center p-2">
              {[0, 1, 2, 3].map(i => (
                <div key={`green-${i}`} className="w-1/3 h-1/3 flex items-center justify-center">
                  <div className="w-5/6 h-5/6 rounded-full bg-white shadow-inner"></div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Blue path (left) */}
          <div className="bg-gray-100 border-r-2 border-gray-800 flex items-center justify-center">
            <div className="w-full h-full grid grid-cols-3 grid-rows-5">
              {Array(15).fill(0).map((_, i) => (
                <div key={`left-${i}`} className="border border-gray-300 flex items-center justify-center">
                  {i === 7 && <div className="w-3/4 h-3/4 bg-blue-600 transform rotate-45"></div>}
                </div>
              ))}
            </div>
          </div>
          
          {/* Center */}
          <div className="bg-gray-200 flex items-center justify-center">
            <div className="w-3/4 h-3/4 bg-gray-800 transform rotate-45 flex items-center justify-center">
              <span className="text-white text-lg font-bold transform -rotate-45">LUDO</span>
            </div>
          </div>
          
          {/* Yellow path (right) */}
          <div className="bg-gray-100 border-l-2 border-gray-800 flex items-center justify-center">
            <div className="w-full h-full grid grid-cols-3 grid-rows-5">
              {Array(15).fill(0).map((_, i) => (
                <div key={`right-${i}`} className="border border-gray-300 flex items-center justify-center">
                  {i === 7 && <div className="w-3/4 h-3/4 bg-yellow-500 transform rotate-45"></div>}
                </div>
              ))}
            </div>
          </div>
          
          {/* Blue home (bottom-left) */}
          <div className="bg-blue-100 border-r-2 border-t-2 border-gray-800 flex items-center justify-center">
            <div className="w-3/4 h-3/4 bg-blue-600 rounded-lg flex flex-wrap items-center justify-center p-2">
              {[0, 1, 2, 3].map(i => (
                <div key={`blue-${i}`} className="w-1/3 h-1/3 flex items-center justify-center">
                  <div className="w-5/6 h-5/6 rounded-full bg-white shadow-inner"></div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Red path (bottom) */}
          <div className="bg-gray-100 border-t-2 border-gray-800 flex items-center justify-center">
            <div className="w-full h-full grid grid-cols-5 grid-rows-3">
              {Array(15).fill(0).map((_, i) => (
                <div key={`bottom-${i}`} className="border border-gray-300 flex items-center justify-center">
                  {i === 7 && <div className="w-3/4 h-3/4 bg-red-600 transform rotate-45"></div>}
                </div>
              ))}
            </div>
          </div>
          
          {/* Yellow home (bottom-right) */}
          <div className="bg-yellow-100 border-l-2 border-t-2 border-gray-800 flex items-center justify-center">
            <div className="w-3/4 h-3/4 bg-yellow-500 rounded-lg flex flex-wrap items-center justify-center p-2">
              {[0, 1, 2, 3].map(i => (
                <div key={`yellow-${i}`} className="w-1/3 h-1/3 flex items-center justify-center">
                  <div className="w-5/6 h-5/6 rounded-full bg-white shadow-inner"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render the dice
  const renderDice = () => {
    return (
      <div className="flex flex-col items-center">
        <div 
          className={`w-16 h-16 bg-white rounded-lg shadow-lg flex items-center justify-center text-3xl font-bold mb-4 ${isRolling ? 'animate-roll' : ''}`}
        >
          {gameState.diceValue > 0 ? gameState.diceValue : '?'}
        </div>
        <Button 
          variant="primary" 
          onClick={rollDice}
          disabled={isRolling || gameState.gameStatus === 'finished'}
          className="w-32"
        >
          Roll Dice
        </Button>
      </div>
    );
  };

  return (
    <>
      <GameLayout
        title="Ludo"
        gameInfo={{
          currentPlayer: gameState.currentPlayer,
          status: gameState.gameStatus,
          moveCount: 0,
        }}
        onShowHelp={() => setShowHelp(true)}
      >
        <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start w-full max-w-6xl mx-auto">
          {/* Ludo board */}
          <div className="w-full max-w-2xl mx-auto">
            {renderBoard()}
          </div>
          
          {/* Game controls and info */}
          <div className="w-full max-w-md space-y-6">
            {/* Current player */}
            <div className="bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-2">Current Turn</h3>
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full ${playerColors[gameState.currentPlayer]}`}></div>
                <span className="text-xl font-bold capitalize">{gameState.currentPlayer}</span>
              </div>
            </div>
            
            {/* Dice */}
            <div className="bg-gray-800 p-4 rounded-lg shadow flex justify-center">
              {renderDice()}
            </div>
            
            {/* Game controls */}
            <div className="bg-gray-800 p-4 rounded-lg shadow">
              <Button 
                variant="secondary" 
                onClick={startNewGame}
                fullWidth
              >
                New Game
              </Button>
            </div>
          </div>
        </div>
      </GameLayout>

      <Modal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title="How to Play Ludo"
      >
        <div className="space-y-4 text-gray-300">
          <p>Ludo is a classic board game for 2 to 4 players.</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Each player has 4 pieces that start in their home area</li>
            <li>Roll a 6 to move a piece out of the home area</li>
            <li>Take turns rolling the dice and moving your pieces around the board</li>
            <li>Capture opponent pieces by landing on them (they return to their home)</li>
            <li>Get all 4 of your pieces to the center to win</li>
          </ul>
          <Button
            variant="primary"
            fullWidth
            onClick={() => setShowHelp(false)}
            className="mt-6"
          >
            Got it
          </Button>
        </div>
      </Modal>
    </>
  );
} 