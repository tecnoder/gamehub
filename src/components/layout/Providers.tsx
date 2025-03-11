'use client';

import { ReactNode, createContext, useEffect, useState } from 'react';

// Theme context
export type ThemeType = {
  background: string;
  cards: string;
  dice: string;
  chessPieces: string;
  ludoPieces: string;
  board: string;
};

type ThemeContextType = {
  theme: ThemeType;
  setTheme: (theme: Partial<ThemeType>) => void;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  isMusicEnabled: boolean;
  toggleMusic: () => void;
};

const defaultTheme: ThemeType = {
  background: 'default',
  cards: 'default',
  dice: 'default',
  chessPieces: 'default',
  ludoPieces: 'default',
  board: 'default',
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  setTheme: () => {},
  isSoundEnabled: true,
  toggleSound: () => {},
  isMusicEnabled: true,
  toggleMusic: () => {},
});

export function Providers({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>(defaultTheme);
  const [isSoundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isMusicEnabled, setMusicEnabled] = useState<boolean>(true);

  // Load user preferences from localStorage when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('gameHubTheme');
      const savedSound = localStorage.getItem('gameHubSound');
      const savedMusic = localStorage.getItem('gameHubMusic');

      if (savedTheme) {
        try {
          setThemeState(JSON.parse(savedTheme));
        } catch (e) {
          console.error('Error parsing saved theme:', e);
        }
      }

      if (savedSound) {
        setSoundEnabled(savedSound === 'true');
      }

      if (savedMusic) {
        setMusicEnabled(savedMusic === 'true');
      }
    }
  }, []);

  // Save user preferences to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gameHubTheme', JSON.stringify(theme));
      localStorage.setItem('gameHubSound', String(isSoundEnabled));
      localStorage.setItem('gameHubMusic', String(isMusicEnabled));
    }
  }, [theme, isSoundEnabled, isMusicEnabled]);

  const setTheme = (newTheme: Partial<ThemeType>) => {
    setThemeState((prev) => ({ ...prev, ...newTheme }));
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  const toggleMusic = () => {
    setMusicEnabled((prev) => !prev);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        isSoundEnabled,
        toggleSound,
        isMusicEnabled,
        toggleMusic,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
} 