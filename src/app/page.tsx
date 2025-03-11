import Image from 'next/image'
import Link from 'next/link'
import { FaChess, FaDice, FaHeart, FaUsers, FaArrowRight } from 'react-icons/fa'
import { GiPokerHand, GiRollingDices, GiChessKnight, GiCardAceSpades, GiCardJoker } from 'react-icons/gi'
import { BsController, BsLightningChargeFill } from 'react-icons/bs'
import { MdOutlineGames } from 'react-icons/md'

// Game data with icons and paths
const games = [
  { id: 'chess', name: 'Chess', icon: FaChess, path: '/games/chess', color: 'from-blue-600 to-blue-800' },
  { id: 'ludo', name: 'Ludo', icon: GiRollingDices, path: '/games/ludo', color: 'from-green-600 to-green-800' },
  { id: 'rummy', name: 'Russian Rummy', icon: GiPokerHand, path: '/games/rummy', color: 'from-red-600 to-red-800' },
  { id: 'hearts', name: 'Hearts', icon: FaHeart, path: '/games/hearts', color: 'from-pink-600 to-pink-800' },
  { id: 'solitaire', name: 'Solitaire', icon: GiCardAceSpades, path: '/games/solitaire', color: 'from-purple-600 to-purple-800' },
  { id: 'spades', name: 'Spades', icon: GiCardJoker, path: '/games/spades', color: 'from-yellow-600 to-yellow-800' },
  { id: 'yahtzee', name: 'Yahtzee', icon: FaDice, path: '/games/yahtzee', color: 'from-indigo-600 to-indigo-800' },
  { id: 'judgement', name: 'Judgement', icon: GiChessKnight, path: '/games/judgement', color: 'from-cyan-600 to-cyan-800' },
];

export default function Home() {
  return (
    <main className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Header with Navigation */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-16 relative">
        <div className="mb-6 sm:mb-0">
          <h1 className="text-4xl font-bold font-montserrat bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            GameHub
          </h1>
          <p className="text-gray-300 mt-2">Your destination for classic board and card games</p>
        </div>
        <div className="flex gap-4">
          <Link 
            href="/login" 
            className="px-5 py-2 rounded-lg bg-transparent border border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white transition-all button-hover"
          >
            Login
          </Link>
          <Link 
            href="/register" 
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 transition-all button-hover animate-pulse-purple"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mb-20 text-center relative">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-5xl sm:text-6xl font-bold mb-6 font-montserrat leading-tight">
            Play <span className="text-blue-400 animate-float inline-block" style={{ animationDelay: '0.5s' }}>Classic Games</span> <br />
            <span className="text-purple-400 animate-float inline-block" style={{ animationDelay: '1s' }}>Reimagined</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Experience your favorite board and card games with modern twists, customizable themes, 
            and play against friends or AI opponents.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/games"
              className="group px-8 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg hover:opacity-90 transition-all button-hover flex items-center justify-center gap-2"
            >
              Play Now
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/games"
              className="px-8 py-3 rounded-lg bg-gray-800/70 backdrop-blur-sm text-white font-semibold text-lg hover:bg-gray-700/70 transition-all button-hover"
            >
              Explore Games
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Games Grid */}
      <section className="mb-20 relative">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <BsLightningChargeFill className="text-yellow-400" />
            Featured Games
          </h3>
          <Link href="/games" className="text-blue-400 hover:underline flex items-center gap-1">
            View All <FaArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.slice(0, 4).map((game) => (
            <Link 
              key={game.id} 
              href={game.path}
              className="bg-gray-800/60 backdrop-blur-sm rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/20 group border border-gray-700/50"
            >
              <div className={`aspect-w-16 aspect-h-9 relative bg-gradient-to-br ${game.color} p-10 flex items-center justify-center overflow-hidden`}>
                <game.icon className="w-16 h-16 text-white opacity-80 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </div>
              <div className="p-4">
                <h4 className="text-xl font-bold">{game.name}</h4>
                <p className="text-gray-400 mt-1">Play online or against AI</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
        <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:bg-gray-700/60 transition-all hover:shadow-lg hover:shadow-blue-900/20 group">
          <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FaUsers className="w-6 h-6" />
          </div>
          <h4 className="text-xl font-bold mb-2">Multiplayer Games</h4>
          <p className="text-gray-300">Play with friends or match with other players online</p>
        </div>
        <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:bg-gray-700/60 transition-all hover:shadow-lg hover:shadow-purple-900/20 group">
          <div className="bg-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <BsController className="w-6 h-6" />
          </div>
          <h4 className="text-xl font-bold mb-2">AI Opponents</h4>
          <p className="text-gray-300">Challenge computer opponents with various difficulty levels</p>
        </div>
        <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:bg-gray-700/60 transition-all hover:shadow-lg hover:shadow-blue-900/20 group">
          <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MdOutlineGames className="w-6 h-6" />
          </div>
          <h4 className="text-xl font-bold mb-2">Customizable Themes</h4>
          <p className="text-gray-300">Personalize game pieces, boards, and backgrounds</p>
        </div>
        <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:bg-gray-700/60 transition-all hover:shadow-lg hover:shadow-purple-900/20 group">
          <div className="bg-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FaChess className="w-6 h-6" />
          </div>
          <h4 className="text-xl font-bold mb-2">Player Progression</h4>
          <p className="text-gray-300">Earn rewards and track your gameplay statistics</p>
        </div>
      </section>

      {/* Join Community CTA */}
      <section className="relative overflow-hidden rounded-2xl p-8 sm:p-12 text-center border border-purple-500/30">
        {/* Glass morphism background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-purple-900/70 backdrop-blur-lg -z-10"></div>
        
        <div className="relative">
          <h3 className="text-3xl font-bold mb-4">Join Our Gaming Community</h3>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Sign up today to save your progress, customize your experience, and join tournaments.
          </p>
          <Link
            href="/register"
            className="group px-8 py-3 rounded-lg bg-white text-purple-900 font-semibold text-lg hover:bg-gray-100 transition-all button-hover flex items-center justify-center gap-2 mx-auto w-fit"
          >
            Create Free Account
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Interactive hint */}
      <div className="fixed bottom-4 left-4 text-xs text-gray-500 bg-gray-800/70 backdrop-blur-sm p-2 rounded-lg shadow-lg animate-pulse">
        Try moving your mouse or touching the screen!
      </div>
    </main>
  )
}
