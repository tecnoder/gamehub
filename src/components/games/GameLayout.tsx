'use client';

import { ReactNode } from 'react';
import { FaCog, FaUndo, FaRedo, FaVolumeUp, FaVolumeMute, FaHome, FaQuestion } from 'react-icons/fa';
import Link from 'next/link';
import { useContext } from 'react';
import { ThemeContext } from '@/components/layout/Providers';

type GameLayoutProps = {
  children: ReactNode;
  title: string;
  gameInfo: {
    currentPlayer?: string;
    status: string;
    moveCount?: number;
    score?: number;
    timeElapsed?: string;
    difficulty?: string;
  };
  onUndo?: () => void;
  onRedo?: () => void;
  onShowHelp?: () => void;
  showUndo?: boolean;
  showRedo?: boolean;
  showHelp?: boolean;
  sidebar?: ReactNode;
  controls?: ReactNode;
};

export default function GameLayout({
  children,
  title,
  gameInfo,
  onUndo,
  onRedo,
  onShowHelp,
  showUndo = true,
  showRedo = true,
  showHelp = true,
  sidebar,
  controls,
}: GameLayoutProps) {
  const { isSoundEnabled, toggleSound } = useContext(ThemeContext);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Game header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold font-montserrat">{title}</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/games"
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600"
            >
              <FaHome />
              Exit Game
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Game info */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">{title}</h2>
              <div className="space-y-4">
                {gameInfo.currentPlayer && (
                  <div className="flex items-center justify-between">
                    <span>Current Player:</span>
                    <span className="font-bold capitalize">{gameInfo.currentPlayer}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <span className="font-bold capitalize">{gameInfo.status}</span>
                </div>
                {gameInfo.moveCount !== undefined && (
                  <div className="flex items-center justify-between">
                    <span>Move Count:</span>
                    <span className="font-bold">{gameInfo.moveCount}</span>
                  </div>
                )}
                {gameInfo.score !== undefined && (
                  <div className="flex items-center justify-between">
                    <span>Score:</span>
                    <span className="font-bold">{gameInfo.score}</span>
                  </div>
                )}
                {gameInfo.timeElapsed && (
                  <div className="flex items-center justify-between">
                    <span>Time:</span>
                    <span className="font-bold">{gameInfo.timeElapsed}</span>
                  </div>
                )}
                {gameInfo.difficulty && (
                  <div className="flex items-center justify-between">
                    <span>Difficulty:</span>
                    <span className="font-bold">{gameInfo.difficulty}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Game controls */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Controls</h3>
              <div className="flex flex-wrap gap-4">
                {showUndo && onUndo && (
                  <button
                    onClick={onUndo}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600"
                  >
                    <FaUndo />
                    Undo
                  </button>
                )}
                {showRedo && onRedo && (
                  <button
                    onClick={onRedo}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600"
                  >
                    <FaRedo />
                    Redo
                  </button>
                )}
                <button
                  onClick={toggleSound}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600"
                >
                  {isSoundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
                  Sound
                </button>
                {showHelp && onShowHelp && (
                  <button
                    onClick={onShowHelp}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600"
                  >
                    <FaQuestion />
                    Help
                  </button>
                )}
              </div>
              {controls && <div className="mt-4">{controls}</div>}
            </div>

            {/* Additional sidebar content */}
            {sidebar && <div className="space-y-6">{sidebar}</div>}
          </div>

          {/* Game content */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl p-4 h-full">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 