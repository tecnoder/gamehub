import Link from 'next/link';
import { FaChess, FaDice, FaDiscord, FaFacebook, FaGamepad, FaTwitter } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand and description */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center">
              <FaGamepad className="h-8 w-8 text-purple-500" />
              <span className="ml-2 text-xl font-bold font-montserrat bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                GameHub
              </span>
            </div>
            <p className="mt-4 text-gray-400 text-sm">
              A modern platform for classic board and card games with multiplayer support, customizable themes, and AI opponents.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <FaTwitter className="h-6 w-6" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FaFacebook className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FaDiscord className="h-6 w-6" />
                <span className="sr-only">Discord</span>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
              Games
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/games/chess" className="text-gray-400 hover:text-white text-sm">
                  Chess
                </Link>
              </li>
              <li>
                <Link href="/games/ludo" className="text-gray-400 hover:text-white text-sm">
                  Ludo
                </Link>
              </li>
              <li>
                <Link href="/games/rummy" className="text-gray-400 hover:text-white text-sm">
                  Russian Rummy
                </Link>
              </li>
              <li>
                <Link href="/games/hearts" className="text-gray-400 hover:text-white text-sm">
                  Hearts
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
              More Games
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/games/solitaire" className="text-gray-400 hover:text-white text-sm">
                  Solitaire
                </Link>
              </li>
              <li>
                <Link href="/games/spades" className="text-gray-400 hover:text-white text-sm">
                  Spades
                </Link>
              </li>
              <li>
                <Link href="/games/yahtzee" className="text-gray-400 hover:text-white text-sm">
                  Yahtzee
                </Link>
              </li>
              <li>
                <Link href="/games/judgement" className="text-gray-400 hover:text-white text-sm">
                  Judgement
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
              Company
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white text-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8">
          <p className="text-sm text-gray-400 text-center">
            &copy; {currentYear} GameHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 