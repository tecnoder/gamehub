'use client';

import { useState, useEffect } from 'react';
import InteractiveBackground from './InteractiveBackground';
import FluidBackground from './FluidBackground';
import ConstellationBackground from './ConstellationBackground';

type BackgroundType = 'particles' | 'fluid' | 'constellation';

export default function BackgroundManager() {
  const [backgroundType, setBackgroundType] = useState<BackgroundType>('constellation');
  const [showControls, setShowControls] = useState(false);

  // Toggle background type with keyboard shortcuts (for debugging)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only activate with Shift+Alt+B
      if (e.shiftKey && e.altKey && e.key === 'B') {
        setShowControls(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Render the selected background */}
      {backgroundType === 'particles' && <InteractiveBackground />}
      {backgroundType === 'fluid' && <FluidBackground />}
      {backgroundType === 'constellation' && <ConstellationBackground />}

      {/* Background switcher (only shown when activated with keyboard shortcut) */}
      {showControls && (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-900/80 backdrop-blur-sm p-2 rounded-lg shadow-lg">
          <div className="text-xs text-gray-400 mb-2">Background Effects:</div>
          <div className="flex gap-2">
            <button
              className={`px-2 py-1 text-xs rounded ${backgroundType === 'particles' ? 'bg-purple-700' : 'bg-gray-700'}`}
              onClick={() => setBackgroundType('particles')}
            >
              Particles
            </button>
            <button
              className={`px-2 py-1 text-xs rounded ${backgroundType === 'fluid' ? 'bg-purple-700' : 'bg-gray-700'}`}
              onClick={() => setBackgroundType('fluid')}
            >
              Fluid
            </button>
            <button
              className={`px-2 py-1 text-xs rounded ${backgroundType === 'constellation' ? 'bg-purple-700' : 'bg-gray-700'}`}
              onClick={() => setBackgroundType('constellation')}
            >
              Constellation
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Press Shift+Alt+B to toggle controls
          </div>
        </div>
      )}
    </>
  );
} 