'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaBars, FaChess, FaGamepad, FaSignInAlt, FaUser, FaVolumeUp, FaVolumeMute, FaTimes } from 'react-icons/fa';
import { ThemeContext } from '@/components/layout/Providers';
import { useContext } from 'react';

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isMusicEnabled, toggleMusic, isSoundEnabled, toggleSound } = useContext(ThemeContext);

  // Function to determine if a link is active
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and site name */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <FaGamepad className="h-8 w-8 text-purple-500" />
              <span className="ml-2 text-xl font-bold font-montserrat bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                GameHub
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link 
                href="/games"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/games') 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Games
              </Link>
              <Link 
                href="/tournaments"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/tournaments') 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Tournaments
              </Link>
              <Link 
                href="/leaderboard"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/leaderboard') 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Leaderboard
              </Link>
            </div>
          </div>

          {/* Sound Controls */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={toggleSound}
              className="text-gray-300 hover:text-white p-2"
              aria-label={isSoundEnabled ? "Disable sound effects" : "Enable sound effects"}
            >
              {isSoundEnabled ? <FaVolumeUp className="h-5 w-5" /> : <FaVolumeMute className="h-5 w-5" />}
            </button>
            
            {/* Auth buttons */}
            <Link 
              href="/login"
              className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Login
            </Link>
            <Link 
              href="/register"
              className="bg-purple-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="text-gray-300 hover:text-white p-2"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              href="/games"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/games') 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              onClick={closeMenu}
            >
              Games
            </Link>
            <Link 
              href="/tournaments"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/tournaments') 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              onClick={closeMenu}
            >
              Tournaments
            </Link>
            <Link 
              href="/leaderboard"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/leaderboard') 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              onClick={closeMenu}
            >
              Leaderboard
            </Link>
            <div className="flex items-center space-x-4 px-3 py-2">
              <button 
                onClick={toggleSound}
                className="text-gray-300 hover:text-white p-2"
                aria-label={isSoundEnabled ? "Disable sound effects" : "Enable sound effects"}
              >
                {isSoundEnabled ? <FaVolumeUp className="h-5 w-5" /> : <FaVolumeMute className="h-5 w-5" />}
              </button>
              <button 
                onClick={toggleMusic}
                className="text-gray-300 hover:text-white p-2"
                aria-label={isMusicEnabled ? "Disable background music" : "Enable background music"}
              >
                {isMusicEnabled ? <FaVolumeUp className="h-5 w-5" /> : <FaVolumeMute className="h-5 w-5" />}
              </button>
            </div>
            <Link 
              href="/login"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              onClick={closeMenu}
            >
              Login
            </Link>
            <Link 
              href="/register"
              className="block px-3 py-2 rounded-md text-base font-medium bg-purple-600 text-white hover:bg-purple-700"
              onClick={closeMenu}
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
} 