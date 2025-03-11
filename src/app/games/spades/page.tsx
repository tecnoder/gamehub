'use client';

import { useState } from 'react';
import GameLayout from '@/components/games/GameLayout';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { FaUser } from 'react-icons/fa';

// Card suits and values
const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Card type definition
type Card = {
  suit: string;
  value: string;
  rank: number; // Numeric rank for comparing cards
};

// Player type definition
type Player = {
  id: number;
  name: string;
  cards: Card[];
  tricks: number;
  bid: number | null;
};

// Game state type
type SpadesGameState = {
  deck: Card[];
  players: Player[];
  currentPlayerIndex: number;
  trick: Card[];
  trickLeader: number;
  phase: 'bidding' | 'playing' | 'scoring';
  roundNumber: number;
  scores: number[]; // Team scores [team1, team2]
  spadesBroken: boolean;
};

export default function SpadesGame() {
  // Initial game state
  const initialState: SpadesGameState = {
    deck: [],
    players: [
      { id: 0, name: 'You', cards: [], tricks: 0, bid: null },
      { id: 1, name: 'Player 2', cards: [], tricks: 0, bid: null },
      { id: 2, name: 'Player 3', cards: [], tricks: 0, bid: null },
      { id: 3, name: 'Player 4', cards: [], tricks: 0, bid: null },
    ],
    currentPlayerIndex: 0,
    trick: [],
    trickLeader: 0,
    phase: 'bidding',
    roundNumber: 1,
    scores: [0, 0],
    spadesBroken: false,
  };

  const [gameState, setGameState] = useState<SpadesGameState>(initialState);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [bidValue, setBidValue] = useState<number>(0);
  const [showHelp, setShowHelp] = useState(false);

  // Create and shuffle a deck of cards
  const createDeck = (): Card[] => {
    const deck: Card[] = [];
    
    SUITS.forEach(suit => {
      VALUES.forEach((value, index) => {
        deck.push({ 
          suit, 
          value, 
          rank: index 
        });
      });
    });
    
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return deck;
  };

  // Deal cards to players
  const dealCards = () => {
    const deck = createDeck();
    const newPlayers = [...gameState.players];
    
    // Deal 13 cards to each player
    newPlayers.forEach((player, index) => {
      player.cards = deck.slice(index * 13, (index + 1) * 13).sort((a, b) => {
        // Sort by suit then by rank
        if (a.suit !== b.suit) {
          return SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
        }
        return b.rank - a.rank;
      });
      player.tricks = 0;
      player.bid = null;
    });
    
    setGameState({
      ...initialState,
      deck,
      players: newPlayers,
      phase: 'bidding'
    });
    
    setSelectedCard(null);
  };

  // Place a bid
  const placeBid = () => {
    if (gameState.phase !== 'bidding') return;
    
    const newPlayers = [...gameState.players];
    newPlayers[gameState.currentPlayerIndex].bid = bidValue;
    
    // AI players make random bids (simplified)
    for (let i = 1; i < 4; i++) {
      const playerIndex = (gameState.currentPlayerIndex + i) % 4;
      const randomBid = Math.floor(Math.random() * 5) + 1;
      newPlayers[playerIndex].bid = randomBid;
    }
    
    // Move to playing phase when all players have bid
    setGameState({
      ...gameState,
      players: newPlayers,
      currentPlayerIndex: 0, // Player with 2 of clubs starts
      phase: 'playing'
    });
  };

  // Play a card
  const playCard = () => {
    if (gameState.phase !== 'playing' || selectedCard === null) return;
    
    const playerCards = [...gameState.players[0].cards];
    const playedCard = playerCards[selectedCard];
    
    // Remove card from player's hand
    playerCards.splice(selectedCard, 1);
    
    // Add card to the trick
    const newTrick = [...gameState.trick, playedCard];
    const newPlayers = [...gameState.players];
    newPlayers[0].cards = playerCards;
    
    // Check if spades are broken
    let spadesBroken = gameState.spadesBroken;
    if (playedCard.suit === 'spades' && !spadesBroken) {
      spadesBroken = true;
    }
    
    // AI players play cards (simplified)
    for (let i = 1; i < 4; i++) {
      const playerIndex = (gameState.currentPlayerIndex + i) % 4;
      const player = newPlayers[playerIndex];
      
      // In a real game, the AI would choose a valid card based on spades rules
      const randomCardIndex = Math.floor(Math.random() * player.cards.length);
      const randomCard = player.cards[randomCardIndex];
      
      newPlayers[playerIndex].cards = player.cards.filter((_, i) => i !== randomCardIndex);
      
      newTrick.push(randomCard);
      
      // Check if spades are broken
      if (randomCard.suit === 'spades' && !spadesBroken) {
        spadesBroken = true;
      }
    }
    
    // Determine winner of the trick (simplified)
    const leadSuit = newTrick[0].suit;
    let winnerIndex = 0;
    let highestRank = newTrick[0].rank;
    let highestSpade = -1;
    
    newTrick.forEach((card, index) => {
      if (card.suit === 'spades' && (highestSpade === -1 || card.rank > newTrick[highestSpade].rank)) {
        highestSpade = index;
      } else if (card.suit === leadSuit && card.rank > highestRank) {
        winnerIndex = index;
        highestRank = card.rank;
      }
    });
    
    // Spades trump other suits
    if (highestSpade !== -1) {
      winnerIndex = highestSpade;
    }
    
    // Adjust winner index based on the current player
    const actualWinnerIndex = (gameState.currentPlayerIndex + winnerIndex) % 4;
    
    // Update player tricks
    newPlayers[actualWinnerIndex].tricks++;
    
    // Check if round is over (all cards played)
    const isRoundOver = newPlayers.every(player => player.cards.length === 0);
    
    if (isRoundOver) {
      // Calculate scores
      const newScores = [...gameState.scores];
      
      // Team 1: Player 0 and 2
      const team1Bid = (newPlayers[0].bid || 0) + (newPlayers[2].bid || 0);
      const team1Tricks = newPlayers[0].tricks + newPlayers[2].tricks;
      
      // Team 2: Player 1 and 3
      const team2Bid = (newPlayers[1].bid || 0) + (newPlayers[3].bid || 0);
      const team2Tricks = newPlayers[1].tricks + newPlayers[3].tricks;
      
      // Simple scoring: 10 points per bid if made, minus 10 per bid if not
      if (team1Tricks >= team1Bid) {
        newScores[0] += team1Bid * 10 + (team1Tricks - team1Bid);
      } else {
        newScores[0] -= team1Bid * 10;
      }
      
      if (team2Tricks >= team2Bid) {
        newScores[1] += team2Bid * 10 + (team2Tricks - team2Bid);
      } else {
        newScores[1] -= team2Bid * 10;
      }
      
      setGameState({
        ...gameState,
        trick: [],
        trickLeader: actualWinnerIndex,
        currentPlayerIndex: actualWinnerIndex,
        players: newPlayers,
        phase: 'scoring',
        scores: newScores,
        spadesBroken: false
      });
    } else {
      setGameState({
        ...gameState,
        trick: [],
        trickLeader: actualWinnerIndex,
        currentPlayerIndex: actualWinnerIndex,
        players: newPlayers,
        spadesBroken
      });
    }
    
    setSelectedCard(null);
  };

  // Start a new round
  const startNewRound = () => {
    setGameState({
      ...gameState,
      roundNumber: gameState.roundNumber + 1,
      phase: 'bidding'
    });
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

  // Initialize the game on mount
  if (gameState.deck.length === 0) {
    dealCards();
  }

  return (
    <>
      <GameLayout
        title="Spades"
        gameInfo={{
          currentPlayer: gameState.players[gameState.currentPlayerIndex].name,
          status: gameState.phase,
          moveCount: gameState.roundNumber,
        }}
        onShowHelp={() => setShowHelp(true)}
      >
        <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
          {/* Game board */}
          <div className="relative bg-green-800 rounded-lg shadow-lg p-4 h-[600px] flex flex-col items-center justify-between">
            {/* Partner */}
            <div className="grid grid-cols-3 gap-4 w-full">
              <div className="col-start-2 flex flex-col items-center">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 mb-2 flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-gray-300" />
                    <h3 className="font-medium text-sm">{gameState.players[2].name}</h3>
                  </div>
                  <div className="flex gap-4 text-xs mt-1">
                    <p className="text-gray-300">Bid: {gameState.players[2].bid ?? '-'}</p>
                    <p className="text-gray-300">Tricks: {gameState.players[2].tricks}</p>
                  </div>
                </div>
                <div className="flex justify-center">
                  {gameState.players[2].cards.length > 0 && Array(Math.min(7, gameState.players[2].cards.length)).fill(0).map((_, i) => (
                    <div key={`p3-card-${i}`} className="h-16 w-10 bg-blue-500 rounded-md -ml-4 first:ml-0 transform-gpu rotate-180">
                      <div className="w-full h-full bg-white m-0.5 rounded-md"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 w-full">
              {/* Left opponent */}
              <div className="flex flex-col items-center">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 mb-2 flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-gray-300" />
                    <h3 className="font-medium text-sm">{gameState.players[1].name}</h3>
                  </div>
                  <div className="flex gap-4 text-xs mt-1">
                    <p className="text-gray-300">Bid: {gameState.players[1].bid ?? '-'}</p>
                    <p className="text-gray-300">Tricks: {gameState.players[1].tricks}</p>
                  </div>
                </div>
                <div className="flex justify-center">
                  {gameState.players[1].cards.length > 0 && Array(Math.min(7, gameState.players[1].cards.length)).fill(0).map((_, i) => (
                    <div key={`p2-card-${i}`} className="h-16 w-10 bg-blue-500 rounded-md -ml-4 first:ml-0 transform-gpu -rotate-90">
                      <div className="w-full h-full bg-white m-0.5 rounded-md"></div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Center trick area */}
              <div className="flex items-center justify-center">
                {gameState.trick.length > 0 ? (
                  <div className="grid grid-cols-2 grid-rows-2 gap-2 w-32 h-32">
                    {Array(4).fill(0).map((_, i) => (
                      <div key={`trick-slot-${i}`} className="bg-green-700/50 rounded-md flex items-center justify-center">
                        {gameState.trick[i] && (
                          <div className="bg-white rounded-md w-14 h-20 flex flex-col items-center justify-center">
                            <div className={`font-bold ${getCardColor(gameState.trick[i].suit)}`}>
                              {gameState.trick[i].value}
                            </div>
                            <div className={`text-2xl ${getCardColor(gameState.trick[i].suit)}`}>
                              {getSuitSymbol(gameState.trick[i].suit)}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-white text-opacity-50">
                    {gameState.phase === 'bidding' ? 'Bidding Phase' : 'Play cards here'}
                  </div>
                )}
              </div>
              
              {/* Right opponent */}
              <div className="flex flex-col items-center">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 mb-2 flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-gray-300" />
                    <h3 className="font-medium text-sm">{gameState.players[3].name}</h3>
                  </div>
                  <div className="flex gap-4 text-xs mt-1">
                    <p className="text-gray-300">Bid: {gameState.players[3].bid ?? '-'}</p>
                    <p className="text-gray-300">Tricks: {gameState.players[3].tricks}</p>
                  </div>
                </div>
                <div className="flex justify-center">
                  {gameState.players[3].cards.length > 0 && Array(Math.min(7, gameState.players[3].cards.length)).fill(0).map((_, i) => (
                    <div key={`p4-card-${i}`} className="h-16 w-10 bg-blue-500 rounded-md -ml-4 first:ml-0 transform-gpu rotate-90">
                      <div className="w-full h-full bg-white m-0.5 rounded-md"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Player's hand */}
            <div className="w-full">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 mb-2 flex flex-col items-center mx-auto max-w-sm">
                <div className="flex items-center gap-2">
                  <FaUser className="text-blue-300" />
                  <h3 className="font-medium">{gameState.players[0].name}</h3>
                </div>
                <div className="flex gap-4 text-xs mt-1">
                  <p className="text-gray-300">Bid: {gameState.players[0].bid ?? '-'}</p>
                  <p className="text-gray-300">Tricks: {gameState.players[0].tricks}</p>
                </div>
                {gameState.phase === 'bidding' && gameState.currentPlayerIndex === 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm">Your bid:</span>
                    <div className="flex">
                      <button 
                        className="bg-gray-700 px-2 py-1 rounded-l hover:bg-gray-600"
                        onClick={() => setBidValue(Math.max(0, bidValue - 1))}
                      >-</button>
                      <div className="bg-gray-800 px-4 py-1">{bidValue}</div>
                      <button 
                        className="bg-gray-700 px-2 py-1 rounded-r hover:bg-gray-600"
                        onClick={() => setBidValue(Math.min(13, bidValue + 1))}
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
              <div className="flex justify-center">
                {gameState.players[0].cards.map((card, index) => (
                  <div 
                    key={`p1-card-${index}`} 
                    className={`h-28 w-20 bg-white rounded-md -ml-4 first:ml-0 hover:translate-y-[-10px] transition-transform ${
                      selectedCard === index ? 'translate-y-[-15px]' : ''
                    } ${gameState.phase === 'playing' && gameState.currentPlayerIndex === 0 ? 'cursor-pointer' : 'opacity-70'}`}
                    onClick={() => {
                      if (gameState.phase === 'playing' && gameState.currentPlayerIndex === 0) {
                        setSelectedCard(index);
                      }
                    }}
                  >
                    <div className={`p-2 h-full flex flex-col justify-between ${getCardColor(card.suit)}`}>
                      <div className="text-lg font-bold">{card.value}</div>
                      <div className="flex justify-center text-3xl">{getSuitSymbol(card.suit)}</div>
                      <div className="text-lg font-bold self-end">{card.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Game controls and info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-2">Team Scores</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-900/50 p-3 rounded-lg">
                  <h4 className="font-medium">Your Team</h4>
                  <p className="text-2xl font-bold">{gameState.scores[0]}</p>
                </div>
                <div className="bg-red-900/50 p-3 rounded-lg">
                  <h4 className="font-medium">Opponent Team</h4>
                  <p className="text-2xl font-bold">{gameState.scores[1]}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg shadow flex gap-4">
              {gameState.phase === 'playing' && gameState.currentPlayerIndex === 0 && selectedCard !== null && (
                <Button 
                  variant="primary" 
                  onClick={playCard}
                  className="flex-1"
                >
                  Play Card
                </Button>
              )}
              
              {gameState.phase === 'scoring' && (
                <Button 
                  variant="primary" 
                  onClick={startNewRound}
                  className="flex-1"
                >
                  Next Round
                </Button>
              )}
              
              <Button 
                variant="secondary" 
                onClick={() => dealCards()}
                className="flex-1"
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
        title="How to Play Spades"
      >
        <div className="space-y-4 text-gray-300">
          <p>Spades is a trick-taking card game played with four players in teams of two.</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Each player is dealt 13 cards</li>
            <li>Players bid on how many tricks they think they'll win</li>
            <li>Teams combine their bids for a team contract</li>
            <li>Spades is always trump (beats any other suit)</li>
            <li>You must follow the suit led if possible</li>
            <li>You cannot lead with spades until spades are "broken" (played to a trick)</li>
            <li>Teams score 10 points per trick bid if they make their contract</li>
            <li>Teams lose 10 points per trick bid if they don't make their contract</li>
            <li>Extra tricks (overtricks) are worth 1 point each</li>
            <li>First team to 500 points wins</li>
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