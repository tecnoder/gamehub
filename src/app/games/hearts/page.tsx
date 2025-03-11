'use client';

import { useState } from 'react';
import GameLayout from '@/components/games/GameLayout';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { FaHeart } from 'react-icons/fa';

// Card suits and values
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Card type definition
type Card = {
  suit: string;
  value: string;
  points: number;
};

// Player type definition
type Player = {
  id: number;
  name: string;
  cards: Card[];
  cardsWon: Card[];
  score: number;
};

// Game state type definition
type HeartsGameState = {
  deck: Card[];
  players: Player[];
  currentPlayerIndex: number;
  trick: Card[];
  trickLeader: number;
  phase: 'dealing' | 'passing' | 'playing' | 'scoring' | 'finished';
  heartsPlayed: boolean;
  roundNumber: number;
};

export default function HeartsGame() {
  // Initial game state
  const initialState: HeartsGameState = {
    deck: [],
    players: [
      { id: 0, name: 'You', cards: [], cardsWon: [], score: 0 },
      { id: 1, name: 'Player 2', cards: [], cardsWon: [], score: 0 },
      { id: 2, name: 'Player 3', cards: [], cardsWon: [], score: 0 },
      { id: 3, name: 'Player 4', cards: [], cardsWon: [], score: 0 },
    ],
    currentPlayerIndex: 0,
    trick: [],
    trickLeader: 0,
    phase: 'dealing',
    heartsPlayed: false,
    roundNumber: 1,
  };

  const [gameState, setGameState] = useState<HeartsGameState>(initialState);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  // Create a fresh deck of cards
  const createDeck = (): Card[] => {
    const newDeck: Card[] = [];
    
    SUITS.forEach(suit => {
      VALUES.forEach(value => {
        const points = suit === 'hearts' ? 1 : value === 'Q' && suit === 'spades' ? 13 : 0;
        newDeck.push({ suit, value, points });
      });
    });
    
    return newDeck;
  };
  
  // Shuffle deck
  const shuffleDeck = (deck: Card[]): Card[] => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Start a new game
  const startNewGame = () => {
    const newDeck = shuffleDeck(createDeck());
    
    // Deal cards (13 to each player)
    const newPlayers = initialState.players.map((player, index) => ({
      ...player,
      cards: newDeck.slice(index * 13, (index + 1) * 13).sort((a, b) => {
        const suitOrder = { 'spades': 0, 'hearts': 1, 'diamonds': 2, 'clubs': 3 };
        const valueOrder = { '2': 0, '3': 1, '4': 2, '5': 3, '6': 4, '7': 5, '8': 6, '9': 7, '10': 8, 'J': 9, 'Q': 10, 'K': 11, 'A': 12 };
        
        if (suitOrder[a.suit as keyof typeof suitOrder] !== suitOrder[b.suit as keyof typeof suitOrder]) {
          return suitOrder[a.suit as keyof typeof suitOrder] - suitOrder[b.suit as keyof typeof suitOrder];
        }
        return valueOrder[a.value as keyof typeof valueOrder] - valueOrder[b.value as keyof typeof valueOrder];
      }),
      cardsWon: [],
      score: 0,
    }));
    
    // Find player with 2 of clubs to start
    const startingPlayerIndex = newPlayers.findIndex(player => 
      player.cards.some(card => card.suit === 'clubs' && card.value === '2')
    );
    
    setGameState({
      ...initialState,
      deck: newDeck,
      players: newPlayers,
      currentPlayerIndex: startingPlayerIndex,
      phase: 'playing',
    });
    
    setSelectedCards([]);
  };

  // Handle card selection
  const handleCardSelect = (cardIndex: number) => {
    if (gameState.phase !== 'playing' || gameState.currentPlayerIndex !== 0) return;
    
    // Only allow selection if it's your turn
    if (selectedCards.includes(cardIndex)) {
      setSelectedCards(selectedCards.filter(i => i !== cardIndex));
    } else if (selectedCards.length === 0) {
      setSelectedCards([cardIndex]);
    }
  };

  // Play selected card
  const playCard = () => {
    if (selectedCards.length !== 1 || gameState.phase !== 'playing') return;
    
    const cardIndex = selectedCards[0];
    const card = gameState.players[0].cards[cardIndex];
    
    // In a real game, we would implement the hearts rules here
    
    // For demo purposes, just remove the card from the player's hand and add to the trick
    const newPlayers = [...gameState.players];
    const newTrick = [...gameState.trick, card];
    
    newPlayers[0] = {
      ...newPlayers[0],
      cards: newPlayers[0].cards.filter((_, i) => i !== cardIndex),
    };
    
    // Simulate other players playing cards
    for (let i = 1; i < 4; i++) {
      const playerIndex = (gameState.currentPlayerIndex + i) % 4;
      const player = newPlayers[playerIndex];
      
      // In a real game, the AI would choose a valid card based on hearts rules
      const randomCardIndex = Math.floor(Math.random() * player.cards.length);
      const randomCard = player.cards[randomCardIndex];
      
      newPlayers[playerIndex] = {
        ...player,
        cards: player.cards.filter((_, i) => i !== randomCardIndex),
      };
      
      newTrick.push(randomCard);
    }
    
    // Determine winner of the trick (simplified)
    const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % 4;
    
    setGameState({
      ...gameState,
      players: newPlayers,
      trick: newTrick,
      currentPlayerIndex: nextPlayerIndex,
    });
    
    setSelectedCards([]);
    
    // Check if the round is over
    if (newPlayers[0].cards.length === 0) {
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          phase: 'scoring',
          trick: [],
        }));
      }, 1000);
    }
  };

  // Get card color based on suit
  const getCardColor = (suit: string): string => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-gray-900';
  };

  // Get suit symbol
  const getSuitSymbol = (suit: string): JSX.Element => {
    switch (suit) {
      case 'hearts':
        return <FaHeart className="text-red-600" />;
      case 'diamonds':
        return <div className="text-red-600">♦</div>;
      case 'clubs':
        return <div className="text-gray-900">♣</div>;
      case 'spades':
        return <div className="text-gray-900">♠</div>;
      default:
        return <div></div>;
    }
  };

  return (
    <>
      <GameLayout
        title="Hearts"
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
            {/* Other players */}
            <div className="grid grid-cols-3 gap-4 w-full">
              <div className="col-start-2 flex flex-col items-center">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 mb-2 text-center">
                  <h3 className="font-medium text-sm">{gameState.players[2].name}</h3>
                  <p className="text-xs text-gray-300">Cards: {gameState.players[2].cards.length}</p>
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
              <div className="flex flex-col items-center">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 mb-2 text-center">
                  <h3 className="font-medium text-sm">{gameState.players[1].name}</h3>
                  <p className="text-xs text-gray-300">Cards: {gameState.players[1].cards.length}</p>
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
                    {gameState.trick.map((card, index) => (
                      <div 
                        key={`trick-${index}`} 
                        className={`bg-white rounded-md flex items-center justify-center transform ${
                          index === 0 ? 'rotate-[-10deg]' : 
                          index === 1 ? 'rotate-[10deg]' : 
                          index === 2 ? 'rotate-[-5deg]' : 'rotate-[5deg]'
                        }`}
                      >
                        <div className={`flex flex-col items-center ${getCardColor(card.suit)}`}>
                          <div>{card.value}</div>
                          <div>{getSuitSymbol(card.suit)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-white text-opacity-50">Play cards here</div>
                )}
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 mb-2 text-center">
                  <h3 className="font-medium text-sm">{gameState.players[3].name}</h3>
                  <p className="text-xs text-gray-300">Cards: {gameState.players[3].cards.length}</p>
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
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 mb-2 text-center mx-auto max-w-xs">
                <h3 className="font-medium">{gameState.players[0].name}</h3>
                <p className="text-xs text-gray-300">Your turn to play a card</p>
              </div>
              <div className="flex justify-center">
                {gameState.players[0].cards.map((card, index) => (
                  <div 
                    key={`p1-card-${index}`} 
                    className={`h-28 w-20 bg-white rounded-md -ml-4 first:ml-0 hover:translate-y-[-10px] transition-transform cursor-pointer ${
                      selectedCards.includes(index) ? 'translate-y-[-15px]' : ''
                    }`}
                    onClick={() => handleCardSelect(index)}
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
          
          {/* Game controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-2">Game Status</h3>
              <div className="grid grid-cols-4 gap-2">
                {gameState.players.map(player => (
                  <div key={`score-${player.id}`} className="bg-gray-700 p-2 rounded">
                    <h4 className="font-medium text-sm">{player.name}</h4>
                    <p className="text-lg">{player.score}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg shadow flex gap-4">
              <Button 
                variant="primary" 
                onClick={playCard}
                disabled={selectedCards.length !== 1 || gameState.phase !== 'playing' || gameState.currentPlayerIndex !== 0}
                className="flex-1"
              >
                Play Card
              </Button>
              <Button 
                variant="secondary" 
                onClick={startNewGame}
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
        title="How to Play Hearts"
      >
        <div className="space-y-4 text-gray-300">
          <p>Hearts is a trick-taking card game for 4 players.</p>
          <ul className="list-disc list-inside space-y-2">
            <li>The goal is to avoid taking hearts and the Queen of Spades</li>
            <li>Each heart is worth 1 point and the Queen of Spades is worth 13 points</li>
            <li>The player with the lowest score wins</li>
            <li>The player with the 2 of Clubs leads the first trick</li>
            <li>You must follow suit if possible</li>
            <li>Hearts cannot be led until they have been "broken" (played in a trick)</li>
            <li>If a player takes all hearts and the Queen of Spades, they "shoot the moon" and get 0 points while everyone else gets 26 points</li>
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