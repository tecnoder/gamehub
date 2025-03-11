'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaChess, FaDice, FaHeart, FaSearch } from 'react-icons/fa';
import { GiPokerHand, GiRollingDices } from 'react-icons/gi';

// Game data
const games = [
  { 
    id: 'chess', 
    name: 'Chess', 
    icon: FaChess, 
    path: '/games/chess',
    description: 'The classic strategy board game of kings and queens.',
    category: 'board',
    players: '1-2',
    difficulty: 'Medium',
    playTime: '15-60 min'
  },
  { 
    id: 'ludo', 
    name: 'Ludo', 
    icon: GiRollingDices, 
    path: '/games/ludo',
    description: 'Race your pieces around the board in this classic game of chance.',
    category: 'board',
    players: '2-4',
    difficulty: 'Easy',
    playTime: '20-40 min'
  },
  { 
    id: 'rummy', 
    name: 'Russian Rummy', 
    icon: GiPokerHand, 
    path: '/games/rummy',
    description: 'Form sets and runs in this popular card game.',
    category: 'card',
    players: '2-6',
    difficulty: 'Medium',
    playTime: '30-60 min'
  },
  { 
    id: 'hearts', 
    name: 'Hearts', 
    icon: FaHeart, 
    path: '/games/hearts',
    description: 'Avoid taking hearts and the queen of spades in this trick-taking game.',
    category: 'card',
    players: '3-4',
    difficulty: 'Medium',
    playTime: '20-30 min'
  },
  { 
    id: 'solitaire', 
    name: 'Solitaire', 
    icon: GiPokerHand, 
    path: '/games/solitaire',
    description: 'The classic single-player card game of patience and strategy.',
    category: 'card',
    players: '1',
    difficulty: 'Easy',
    playTime: '5-15 min'
  },
  { 
    id: 'spades', 
    name: 'Spades', 
    icon: GiPokerHand, 
    path: '/games/spades',
    description: 'A trick-taking card game with bidding and partnerships.',
    category: 'card',
    players: '2-4',
    difficulty: 'Medium',
    playTime: '30-60 min'
  },
  { 
    id: 'yahtzee', 
    name: 'Yahtzee', 
    icon: FaDice, 
    path: '/games/yahtzee',
    description: 'Roll dice to create different combinations and score points.',
    category: 'dice',
    players: '1-4',
    difficulty: 'Easy',
    playTime: '15-30 min'
  },
  { 
    id: 'judgement', 
    name: 'Judgement', 
    icon: GiPokerHand, 
    path: '/games/judgement',
    description: 'A trick-taking card game where players bid on the number of tricks they will win.',
    category: 'card',
    players: '3-8',
    difficulty: 'Hard',
    playTime: '30-60 min'
  },
];

// Categories for filtering
const categories = [
  { id: 'all', name: 'All Games' },
  { id: 'board', name: 'Board Games' },
  { id: 'card', name: 'Card Games' },
  { id: 'dice', name: 'Dice Games' },
];

export default function GamesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter games based on search term and category
  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         game.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 font-montserrat">Games Library</h1>
        
        {/* Search and filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map(category => (
              <button
                key={category.id}
                className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Games grid */}
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game) => (
              <Link 
                key={game.id} 
                href={game.path}
                className="bg-gray-800 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/20 flex flex-col h-full"
              >
                <div className="aspect-w-16 aspect-h-9 relative bg-gradient-to-br from-blue-900 to-purple-900 p-10 flex items-center justify-center">
                  <game.icon className="w-16 h-16 text-white opacity-80" />
                </div>
                <div className="p-4 flex-grow">
                  <h2 className="text-xl font-bold mb-2">{game.name}</h2>
                  <p className="text-gray-400 text-sm mb-4">{game.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                    <div>
                      <span className="font-semibold">Players:</span> {game.players}
                    </div>
                    <div>
                      <span className="font-semibold">Difficulty:</span> {game.difficulty}
                    </div>
                    <div className="col-span-2">
                      <span className="font-semibold">Play Time:</span> {game.playTime}
                    </div>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <div className="w-full py-2 text-center bg-purple-600 hover:bg-purple-700 rounded-md text-white font-medium">
                    Play Now
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-300">No games found matching your search</h3>
            <p className="text-gray-400 mt-2">Try adjusting your search terms or filters</p>
            <button
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 