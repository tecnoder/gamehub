'use client';

import { useState } from 'react';
import GameLayout from '@/components/games/GameLayout';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { FaUser } from 'react-icons/fa';

// Card suits and values
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Card type definition
type Card = {
  suit: string;
  value: string;
  rank: number; // For comparing cards
  id: string; // Unique identifier
};

// Player type
type Player = {
  id: number;
  name: string;
  cards: Card[];
  bid: number | null;
  tricks: number;
  score: number;
};

// Game state
type JudgementGameState = {
  deck: Card[];
  players: Player[];
  cardsPerPlayer: number;
  currentPlayerIndex: number;
  phase: 'bidding' | 'playing' | 'scoring';
  roundNumber: number;
  trumpSuit: string | null;
  currentTrick: Card[];
  trickStartPlayer: number;
};

export default function JudgementGame() {
  // Create initial state
  const createInitialState = (cardsPerRound: number = 1): JudgementGameState => {
    // Create players
    const players: Player[] = [
      { id: 0, name: 'You', cards: [], bid: null, tricks: 0, score: 0 },
      { id: 1, name: 'Player 2', cards: [], bid: null, tricks: 0, score: 0 },
      { id: 2, name: 'Player 3', cards: [], bid: null, tricks: 0, score: 0 },
      { id: 3, name: 'Player 4', cards: [], bid: null, tricks: 0, score: 0 },
    ];
    
    // Create and shuffle deck
    const deck = createShuffledDeck();
    
    return {
      deck,
      players,
      cardsPerPlayer: cardsPerRound,
      currentPlayerIndex: 0,
      phase: 'bidding',
      roundNumber: 1,
      trumpSuit: null,
      currentTrick: [],
      trickStartPlayer: 0,
    };
  };

  const [gameState, setGameState] = useState<JudgementGameState>(createInitialState());
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [bidValue, setBidValue] = useState<number>(0);
  const [showHelp, setShowHelp] = useState(false);

  // Create and shuffle deck
  function createShuffledDeck(): Card[] {
    const deck: Card[] = [];
    
    SUITS.forEach(suit => {
      VALUES.forEach((value, index) => {
        deck.push({
          suit,
          value,
          rank: index,
          id: `${suit}-${value}-${Math.random()}`
        });
      });
    });
    
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return deck;
  }

  // Deal cards to all players
  const dealCards = () => {
    const deck = createShuffledDeck();
    const newPlayers = [...gameState.players].map(player => ({ 
      ...player, 
      cards: [],
      bid: null,
      tricks: 0
    }));
    
    // Deal cards
    for (let i = 0; i < gameState.cardsPerPlayer; i++) {
      for (let j = 0; j < newPlayers.length; j++) {
        if (deck.length > 0) {
          const card = deck.pop();
          if (card) {
            newPlayers[j].cards.push(card);
          }
        }
      }
    }
    
    // Sort player's cards by suit and rank
    newPlayers[0].cards.sort((a, b) => {
      if (a.suit !== b.suit) {
        return SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
      }
      return b.rank - a.rank;
    });
    
    // Set random trump suit
    const trumpSuit = SUITS[Math.floor(Math.random() * SUITS.length)];
    
    setGameState({
      ...gameState,
      deck,
      players: newPlayers,
      phase: 'bidding',
      trumpSuit,
      currentTrick: [],
      currentPlayerIndex: 0,
    });
    
    setSelectedCard(null);
  };

  // Place a bid
  const placeBid = () => {
    if (gameState.phase !== 'bidding' || gameState.currentPlayerIndex !== 0) return;
    
    const newPlayers = [...gameState.players];
    newPlayers[0].bid = bidValue;
    
    // AI players make random bids
    let totalBids = bidValue;
    for (let i = 1; i < newPlayers.length; i++) {
      const maxPossibleBid = gameState.cardsPerPlayer;
      const randomBid = Math.floor(Math.random() * (maxPossibleBid + 1));
      newPlayers[i].bid = randomBid;
      totalBids += randomBid;
    }
    
    // Move to playing phase
    setGameState({
      ...gameState,
      players: newPlayers,
      phase: 'playing',
      currentPlayerIndex: 0,
      trickStartPlayer: 0,
    });
  };

  // Play a card
  const playCard = () => {
    if (gameState.phase !== 'playing' || gameState.currentPlayerIndex !== 0 || !selectedCard) return;
    
    // Find selected card
    const playerCards = [...gameState.players[0].cards];
    const cardIndex = playerCards.findIndex(card => card.id === selectedCard);
    
    if (cardIndex === -1) return;
    
    // Remove card from player's hand and add to current trick
    const playedCard = playerCards.splice(cardIndex, 1)[0];
    const newTrick = [...gameState.currentTrick, playedCard];
    
    const newPlayers = [...gameState.players];
    newPlayers[0].cards = playerCards;
    
    // AI players play cards (simplified)
    for (let i = 1; i < newPlayers.length; i++) {
      const aiPlayer = newPlayers[i];
      
      // Very simple AI - just play a random card
      // In a real game, this would be more sophisticated with suit following rules
      const randomIndex = Math.floor(Math.random() * aiPlayer.cards.length);
      const aiCard = aiPlayer.cards.splice(randomIndex, 1)[0];
      newTrick.push(aiCard);
    }
    
    // Determine winner of the trick
    const leadSuit = newTrick[0].suit;
    let winnerIndex = 0;
    let highestRank = newTrick[0].rank;
    let highestTrump = -1;
    
    newTrick.forEach((card, index) => {
      if (card.suit === gameState.trumpSuit) {
        if (highestTrump === -1 || card.rank > newTrick[highestTrump].rank) {
          highestTrump = index;
        }
      } else if (card.suit === leadSuit && card.rank > highestRank) {
        winnerIndex = index;
        highestRank = card.rank;
      }
    });
    
    // Trump beats lead suit
    if (highestTrump !== -1) {
      winnerIndex = highestTrump;
    }
    
    // Adjust for player rotation
    const actualWinnerIndex = (gameState.trickStartPlayer + winnerIndex) % 4;
    
    // Update player tricks
    newPlayers[actualWinnerIndex].tricks++;
    
    // Check if round is over (all cards played)
    const isRoundOver = newPlayers.every(player => player.cards.length === 0);
    
    if (isRoundOver) {
      // Score the round
      newPlayers.forEach(player => {
        if (player.bid === player.tricks) {
          // Bonus for making exact bid
          player.score += 10 + player.bid * player.bid;
        } else {
          // Penalty for missing bid
          player.score -= Math.abs(player.bid! - player.tricks) * 5;
        }
      });
      
      // Go to next round or end game
      const nextRound = gameState.roundNumber + 1;
      const nextCardsPerPlayer = gameState.cardsPerPlayer < 10 
        ? gameState.cardsPerPlayer + 1 
        : gameState.cardsPerPlayer - 1;
      
      // If played all rounds (typically 1-10-1), game is over
      const gameOver = nextCardsPerPlayer === 0;
      
      if (gameOver) {
        setGameState({
          ...gameState,
          phase: 'scoring',
          roundNumber: nextRound,
          currentTrick: [],
          players: newPlayers,
        });
      } else {
        // Set up next round
        setGameState({
          ...gameState,
          roundNumber: nextRound,
          cardsPerPlayer: nextCardsPerPlayer,
          phase: 'bidding',
          currentTrick: [],
          players: newPlayers,
          currentPlayerIndex: 0,
        });
        
        // Deal cards for the next round
        setTimeout(() => dealCards(), 2000);
      }
    } else {
      // Continue to next trick
      setGameState({
        ...gameState,
        currentTrick: [],
        trickStartPlayer: actualWinnerIndex,
        currentPlayerIndex: actualWinnerIndex,
        players: newPlayers,
      });
    }
    
    setSelectedCard(null);
  };

  // Start a new game
  const startNewGame = () => {
    const newState = createInitialState();
    setGameState(newState);
    setBidValue(0);
    setSelectedCard(null);
    dealCards();
  };

  // Get card color based on suit
  const getCardColor = (suit: string): string => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-gray-900';
  };

  // Get suit symbol
  const getSuitSymbol = (suit: string): string => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  };

  // Initialize game on first render
  if (gameState.players[0].cards.length === 0) {
    dealCards();
  }

  return (
    <>
      <GameLayout
        title="Judgement"
        gameInfo={{
          currentPlayer: gameState.players[gameState.currentPlayerIndex].name,
          status: gameState.phase,
          moveCount: gameState.roundNumber,
        }}
        onShowHelp={() => setShowHelp(true)}
      >
        <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
          <div className="bg-gray-800 p-3 rounded-lg shadow">
            <div className="flex justify-between">
              <div>
                <span className="text-gray-400">Round:</span>
                <span className="ml-2 font-bold">{gameState.roundNumber}</span>
              </div>
              <div>
                <span className="text-gray-400">Cards per player:</span>
                <span className="ml-2 font-bold">{gameState.cardsPerPlayer}</span>
              </div>
              <div>
                <span className="text-gray-400">Trump suit:</span>
                <span className={`ml-2 font-bold ${getCardColor(gameState.trumpSuit || '')}`}>
                  {gameState.trumpSuit ? getSuitSymbol(gameState.trumpSuit) : 'None'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Game board */}
          <div className="bg-green-800 rounded-lg shadow-lg p-6 min-h-[450px] relative">
            {/* Other players */}
            <div className="grid grid-cols-3 grid-rows-2 gap-4 mb-6">
              {/* Top player (partner) */}
              <div className="col-start-2 col-span-1 flex flex-col items-center">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 mb-2 flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-gray-300" />
                    <h3 className="font-medium text-sm">{gameState.players[2].name}</h3>
                  </div>
                  <div className="flex flex-col text-xs text-center">
                    <p className="text-gray-300">
                      Bid: {gameState.players[2].bid ?? '-'} | Tricks: {gameState.players[2].tricks}
                    </p>
                    <p className="text-gray-300">Score: {gameState.players[2].score}</p>
                  </div>
                </div>
                <div className="flex justify-center">
                  {gameState.players[2].cards.map((_, i) => (
                    <div key={`p3-card-${i}`} className="h-16 w-10 bg-blue-500 rounded-md -ml-4 first:ml-0 transform-gpu rotate-180">
                      <div className="w-full h-full bg-white m-0.5 rounded-md"></div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Left player */}
              <div className="col-start-1 row-start-2 flex flex-col items-center">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 mb-2 flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-gray-300" />
                    <h3 className="font-medium text-sm">{gameState.players[1].name}</h3>
                  </div>
                  <div className="flex flex-col text-xs text-center">
                    <p className="text-gray-300">
                      Bid: {gameState.players[1].bid ?? '-'} | Tricks: {gameState.players[1].tricks}
                    </p>
                    <p className="text-gray-300">Score: {gameState.players[1].score}</p>
                  </div>
                </div>
                <div className="flex justify-center">
                  {gameState.players[1].cards.map((_, i) => (
                    <div key={`p2-card-${i}`} className="h-16 w-10 bg-blue-500 rounded-md -ml-4 first:ml-0 transform-gpu -rotate-90">
                      <div className="w-full h-full bg-white m-0.5 rounded-md"></div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Center - current trick */}
              <div className="col-start-2 row-start-2 flex items-center justify-center">
                {gameState.phase === 'playing' && (
                  <div className="text-center">
                    <h4 className="text-gray-300 mb-2">Current Trick</h4>
                    <div className="grid grid-cols-2 grid-rows-2 gap-2 w-28 h-28">
                      {[0, 1, 2, 3].map(i => (
                        <div key={`trick-slot-${i}`} className="bg-green-700/50 rounded-md flex items-center justify-center">
                          {gameState.currentTrick[i] && (
                            <div className="bg-white rounded-md w-12 h-16 flex flex-col items-center justify-center">
                              <div className={`font-bold ${getCardColor(gameState.currentTrick[i].suit)}`}>
                                {gameState.currentTrick[i].value}
                              </div>
                              <div className={`text-lg ${getCardColor(gameState.currentTrick[i].suit)}`}>
                                {getSuitSymbol(gameState.currentTrick[i].suit)}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {gameState.phase === 'bidding' && (
                  <div className="text-center text-white text-opacity-80">
                    <h3 className="text-xl font-medium mb-2">Bidding Phase</h3>
                    <p>Predict how many tricks you'll take</p>
                  </div>
                )}
              </div>
              
              {/* Right player */}
              <div className="col-start-3 row-start-2 flex flex-col items-center">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 mb-2 flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-gray-300" />
                    <h3 className="font-medium text-sm">{gameState.players[3].name}</h3>
                  </div>
                  <div className="flex flex-col text-xs text-center">
                    <p className="text-gray-300">
                      Bid: {gameState.players[3].bid ?? '-'} | Tricks: {gameState.players[3].tricks}
                    </p>
                    <p className="text-gray-300">Score: {gameState.players[3].score}</p>
                  </div>
                </div>
                <div className="flex justify-center">
                  {gameState.players[3].cards.map((_, i) => (
                    <div key={`p4-card-${i}`} className="h-16 w-10 bg-blue-500 rounded-md -ml-4 first:ml-0 transform-gpu rotate-90">
                      <div className="w-full h-full bg-white m-0.5 rounded-md"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Player's hand */}
            <div className="mt-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 mb-3 flex justify-between items-center mx-auto max-w-lg">
                <div className="flex items-center gap-2">
                  <FaUser className="text-blue-300" />
                  <h3 className="font-medium">{gameState.players[0].name}</h3>
                </div>
                <div className="flex gap-4 text-sm">
                  <p className="text-gray-300">
                    Bid: {gameState.players[0].bid ?? '-'} | Tricks: {gameState.players[0].tricks}
                  </p>
                  <p className="text-gray-300">Score: {gameState.players[0].score}</p>
                </div>
                {gameState.phase === 'bidding' && gameState.currentPlayerIndex === 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Your bid:</span>
                    <div className="flex">
                      <button 
                        className="bg-gray-700 px-2 py-1 rounded-l hover:bg-gray-600"
                        onClick={() => setBidValue(Math.max(0, bidValue - 1))}
                      >-</button>
                      <div className="bg-gray-800 px-4 py-1">{bidValue}</div>
                      <button 
                        className="bg-gray-700 px-2 py-1 rounded-r hover:bg-gray-600"
                        onClick={() => setBidValue(Math.min(gameState.cardsPerPlayer, bidValue + 1))}
                      >+</button>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={placeBid}
                    >
                      Confirm Bid
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex justify-center mb-4">
                {gameState.players[0].cards.map((card) => (
                  <div 
                    key={card.id} 
                    className={`h-36 w-24 bg-white rounded-md -ml-6 first:ml-0 cursor-pointer hover:translate-y-[-10px] transition-transform ${
                      selectedCard === card.id ? 'translate-y-[-15px] ring-2 ring-blue-500' : ''
                    } ${gameState.phase === 'playing' && gameState.currentPlayerIndex === 0 ? '' : 'opacity-70'}`}
                    onClick={() => {
                      if (gameState.phase === 'playing' && gameState.currentPlayerIndex === 0) {
                        setSelectedCard(card.id);
                      }
                    }}
                  >
                    <div className={`p-2 h-full flex flex-col justify-between ${getCardColor(card.suit)}`}>
                      <div className="text-lg font-bold">{card.value}</div>
                      <div className="flex justify-center text-4xl">{getSuitSymbol(card.suit)}</div>
                      <div className="text-lg font-bold self-end">{card.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Player actions */}
              <div className="flex justify-center">
                {gameState.phase === 'playing' && gameState.currentPlayerIndex === 0 && selectedCard && (
                  <Button
                    variant="primary"
                    onClick={playCard}
                  >
                    Play Card
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Game controls */}
          <div className="flex justify-center">
            <Button
              variant="secondary"
              onClick={startNewGame}
            >
              New Game
            </Button>
          </div>
          
          {/* Scoring overlay */}
          {gameState.phase === 'scoring' && (
            <div className="bg-gray-900/80 backdrop-blur-sm fixed inset-0 flex items-center justify-center z-50">
              <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-8 rounded-xl shadow-2xl max-w-md w-full animate-modal-appear">
                <h2 className="text-3xl font-bold mb-6 text-center">Final Scores</h2>
                <div className="space-y-4">
                  {gameState.players
                    .slice()
                    .sort((a, b) => b.score - a.score)
                    .map((player, index) => (
                      <div 
                        key={player.id} 
                        className={`flex justify-between items-center p-3 rounded-lg ${
                          index === 0 ? 'bg-yellow-700/50 font-bold' : 'bg-gray-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {index === 0 && <span className="text-yellow-400">🏆</span>}
                          <span>{player.name}</span>
                        </div>
                        <span className="text-xl">{player.score} pts</span>
                      </div>
                    ))}
                </div>
                <Button
                  variant="primary"
                  onClick={startNewGame}
                  fullWidth
                  className="mt-8"
                >
                  Play Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </GameLayout>

      <Modal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title="How to Play Judgement"
      >
        <div className="space-y-4 text-gray-300">
          <p>Judgement is a trick-taking card game also known as "Oh Hell" or "Wizard".</p>
          <ul className="list-disc list-inside space-y-2">
            <li>The game is played with a standard deck of 52 cards</li>
            <li>In each round, players are dealt an increasing number of cards (1-10-1)</li>
            <li>Each player must bid how many tricks they think they'll win</li>
            <li>The goal is to make exactly the number of tricks you bid</li>
            <li>A random trump suit is selected for each round</li>
            <li>Players must follow the suit led if possible</li>
            <li>The highest card of the led suit wins, unless trumped</li>
            <li>Scoring: 10 + (bid × bid) points for making exactly your bid</li>
            <li>-5 points for each trick over or under your bid</li>
            <li>The player with the highest score after all rounds wins</li>
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