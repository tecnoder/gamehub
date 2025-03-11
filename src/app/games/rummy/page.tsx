'use client';

import { useState } from 'react';
import GameLayout from '@/components/games/GameLayout';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { FaUser } from 'react-icons/fa';

// Card suits and values
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Card type definition
type Card = {
  suit: string;
  value: string;
  rank: number;
  id: string; // Unique identifier
};

// Game state
type RummyGameState = {
  deck: Card[];
  discardPile: Card[];
  playerHand: Card[];
  aiHands: number[];
  currentPlayer: number;
  gameOver: boolean;
  winner: number | null;
  round: number;
  score: number[];
};

export default function RummyGame() {
  // Create initial state
  const createInitialState = (): RummyGameState => {
    const deck = createShuffledDeck();
    
    // Deal 7 cards to each player
    const playerHand = deck.splice(0, 7);
    const aiHands = [7, 7, 7]; // Start each AI with 7 cards
    
    // Place first card in discard pile
    const discardPile = [deck.splice(0, 1)[0]];
    
    return {
      deck,
      discardPile,
      playerHand,
      aiHands,
      currentPlayer: 0,
      gameOver: false,
      winner: null,
      round: 1,
      score: [0, 0, 0, 0],
    };
  };

  const [gameState, setGameState] = useState<RummyGameState>(createInitialState());
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [meldType, setMeldType] = useState<'run' | 'set' | null>(null);

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
    
    // Add jokers
    deck.push({ suit: 'joker', value: 'Joker', rank: 99, id: `joker-1-${Math.random()}` });
    deck.push({ suit: 'joker', value: 'Joker', rank: 99, id: `joker-2-${Math.random()}` });
    
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return deck;
  }

  // Draw card from deck
  const drawFromDeck = () => {
    if (gameState.currentPlayer !== 0 || gameState.gameOver) return;
    
    if (gameState.deck.length === 0) {
      // Reshuffle discard pile except top card
      const newDeck = [...gameState.discardPile.slice(0, -1)];
      const topDiscard = gameState.discardPile[gameState.discardPile.length - 1];
      
      // Shuffle
      for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
      }
      
      setGameState({
        ...gameState,
        deck: newDeck,
        discardPile: [topDiscard],
      });
      return;
    }
    
    const newDeck = [...gameState.deck];
    const drawnCard = newDeck.pop();
    
    if (!drawnCard) return;
    
    setGameState({
      ...gameState,
      deck: newDeck,
      playerHand: [...gameState.playerHand, drawnCard],
    });
    
    setSelectedCards([]);
  };

  // Draw from discard pile
  const drawFromDiscard = () => {
    if (gameState.currentPlayer !== 0 || gameState.gameOver || gameState.discardPile.length === 0) return;
    
    const newDiscardPile = [...gameState.discardPile];
    const drawnCard = newDiscardPile.pop();
    
    if (!drawnCard) return;
    
    setGameState({
      ...gameState,
      discardPile: newDiscardPile,
      playerHand: [...gameState.playerHand, drawnCard],
    });
    
    setSelectedCards([]);
  };

  // Discard a card
  const discardCard = () => {
    if (gameState.currentPlayer !== 0 || gameState.gameOver || selectedCards.length !== 1) return;
    
    const selectedCardId = selectedCards[0];
    const selectedCardIndex = gameState.playerHand.findIndex(card => card.id === selectedCardId);
    
    if (selectedCardIndex === -1) return;
    
    const newPlayerHand = [...gameState.playerHand];
    const discardedCard = newPlayerHand.splice(selectedCardIndex, 1)[0];
    
    // Simulate AI turns
    const newDeck = [...gameState.deck];
    const newAiHands = [...gameState.aiHands];
    let newDiscardPile = [...gameState.discardPile, discardedCard];
    
    // Each AI draws and discards (simplified)
    for (let i = 0; i < newAiHands.length; i++) {
      if (newDeck.length > 0) {
        newDeck.pop(); // AI draws
      }
      
      if (Math.random() > 0.7) {
        // AI sometimes draws from discard pile instead
        newDiscardPile.pop();
      }
      
      // AI always discards
      newDiscardPile.push({
        suit: SUITS[Math.floor(Math.random() * SUITS.length)],
        value: VALUES[Math.floor(Math.random() * VALUES.length)],
        rank: Math.floor(Math.random() * 13),
        id: `ai-discard-${Math.random()}`
      });
    }
    
    // Check for win condition
    let gameOver = false;
    let winner = null;
    
    if (newPlayerHand.length === 0) {
      gameOver = true;
      winner = 0;
    } else {
      // Check if any AI has won (very simplistic)
      const winningAi = newAiHands.findIndex(handSize => handSize === 0);
      if (winningAi !== -1) {
        gameOver = true;
        winner = winningAi + 1;
      }
    }
    
    setGameState({
      ...gameState,
      deck: newDeck,
      discardPile: newDiscardPile,
      playerHand: newPlayerHand,
      currentPlayer: 0, // Player's turn again for demo purposes
      gameOver,
      winner
    });
    
    setSelectedCards([]);
  };

  // Toggle card selection
  const toggleCardSelection = (cardId: string) => {
    if (gameState.currentPlayer !== 0 || gameState.gameOver) return;
    
    if (selectedCards.includes(cardId)) {
      setSelectedCards(selectedCards.filter(id => id !== cardId));
    } else {
      setSelectedCards([...selectedCards, cardId]);
    }
  };

  // Form a meld (set or run)
  const formMeld = () => {
    if (gameState.currentPlayer !== 0 || gameState.gameOver || !meldType || selectedCards.length < 3) return;
    
    const selectedCardObjects = selectedCards.map(id => 
      gameState.playerHand.find(card => card.id === id)
    ).filter(card => card !== undefined) as Card[];
    
    let isValidMeld = false;
    
    if (meldType === 'set') {
      // Check if all cards have same value
      const values = new Set(selectedCardObjects.map(card => card.value));
      isValidMeld = values.size === 1 || (values.size === selectedCardObjects.length - 1 && selectedCardObjects.some(card => card.suit === 'joker'));
    } else if (meldType === 'run') {
      // Check for sequential cards of same suit
      const suit = selectedCardObjects[0].suit;
      const allSameSuit = selectedCardObjects.every(card => card.suit === suit || card.suit === 'joker');
      
      if (allSameSuit) {
        const nonJokers = selectedCardObjects.filter(card => card.suit !== 'joker');
        const sortedCards = [...nonJokers].sort((a, b) => a.rank - b.rank);
        const isSequential = sortedCards.every((card, i) => 
          i === 0 || card.rank === sortedCards[i-1].rank + 1
        );
        
        const jokerCount = selectedCardObjects.length - nonJokers.length;
        const gaps = sortedCards.reduce((count, card, i) => {
          if (i === 0) return count;
          return count + (card.rank - sortedCards[i-1].rank - 1);
        }, 0);
        
        isValidMeld = isSequential || (gaps <= jokerCount);
      }
    }
    
    if (isValidMeld) {
      // Remove melded cards from hand
      const newPlayerHand = gameState.playerHand.filter(card => !selectedCards.includes(card.id));
      
      // Check for win
      const gameOver = newPlayerHand.length === 0;
      
      setGameState({
        ...gameState,
        playerHand: newPlayerHand,
        gameOver,
        winner: gameOver ? 0 : null
      });
      
      setSelectedCards([]);
      setMeldType(null);
    } else {
      // Invalid meld - provide feedback in a real game
      alert('Invalid meld! Please select valid cards for your meld type.');
    }
  };

  // Start a new game
  const startNewGame = () => {
    setGameState(createInitialState());
    setSelectedCards([]);
    setMeldType(null);
  };

  // Sort player's hand
  const sortHand = () => {
    const sortedHand = [...gameState.playerHand].sort((a, b) => {
      if (a.suit !== b.suit) {
        return SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
      }
      return a.rank - b.rank;
    });
    
    setGameState({
      ...gameState,
      playerHand: sortedHand
    });
  };

  // Get card color based on suit
  const getCardColor = (suit: string): string => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : suit === 'joker' ? 'text-purple-600' : 'text-gray-900';
  };

  // Get suit symbol
  const getSuitSymbol = (suit: string): string => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      case 'joker': return '★';
      default: return '';
    }
  };

  return (
    <>
      <GameLayout
        title="Rummy"
        gameInfo={{
          currentPlayer: gameState.currentPlayer === 0 ? 'You' : `Player ${gameState.currentPlayer + 1}`,
          status: gameState.gameOver ? 'finished' : 'playing',
          moveCount: gameState.round,
        }}
        onShowHelp={() => setShowHelp(true)}
      >
        <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
          {/* Opponent players */}
          <div className="grid grid-cols-3 gap-4">
            {gameState.aiHands.map((handSize, i) => (
              <div key={`player-${i+1}`} className="bg-gray-800/80 backdrop-blur-sm p-3 rounded-lg shadow flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2">
                  <FaUser className="text-gray-300" />
                  <h3 className="font-medium">Player {i+2}</h3>
                </div>
                <div className="flex justify-center mb-1">
                  {Array(Math.min(handSize, 7)).fill(0).map((_, j) => (
                    <div key={`ai-${i}-card-${j}`} className="h-16 w-10 bg-blue-500 rounded-md -ml-4 first:ml-0">
                      <div className="w-full h-full bg-white m-0.5 rounded-md"></div>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-400">Cards: {handSize}</div>
              </div>
            ))}
          </div>
          
          {/* Game board */}
          <div className="bg-green-800 rounded-lg shadow-lg p-6 min-h-[300px]">
            <div className="flex justify-center gap-10 mb-8">
              {/* Draw pile */}
              <div>
                <h4 className="text-center mb-2 text-gray-300">Draw Pile</h4>
                <div 
                  className="h-32 w-24 bg-blue-500 rounded-md cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={drawFromDeck}
                >
                  <div className="w-full h-full bg-white m-0.5 rounded-md flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                    <div className="w-16 h-16 border-4 border-white border-dashed rounded-full flex items-center justify-center">
                      <span className="text-sm">{gameState.deck.length} cards</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Discard pile */}
              <div>
                <h4 className="text-center mb-2 text-gray-300">Discard Pile</h4>
                {gameState.discardPile.length > 0 ? (
                  <div 
                    className="h-32 w-24 bg-white rounded-md cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={drawFromDiscard}
                  >
                    <div className="p-2 h-full flex flex-col justify-between">
                      <div className={`text-lg font-bold ${getCardColor(gameState.discardPile[gameState.discardPile.length - 1].suit)}`}>
                        {gameState.discardPile[gameState.discardPile.length - 1].value}
                      </div>
                      <div className="flex justify-center text-3xl">
                        <span className={getCardColor(gameState.discardPile[gameState.discardPile.length - 1].suit)}>
                          {getSuitSymbol(gameState.discardPile[gameState.discardPile.length - 1].suit)}
                        </span>
                      </div>
                      <div className={`text-lg font-bold self-end ${getCardColor(gameState.discardPile[gameState.discardPile.length - 1].suit)}`}>
                        {gameState.discardPile[gameState.discardPile.length - 1].value}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-32 w-24 bg-gray-700 rounded-md border border-gray-600 flex items-center justify-center">
                    <span className="text-sm text-gray-400">Empty</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Player's hand */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-gray-300 font-medium">Your Hand</h4>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={sortHand}
                  >
                    Sort Hand
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setMeldType('set')}
                      className={meldType === 'set' ? 'bg-blue-700' : ''}
                    >
                      Form Set
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setMeldType('run')}
                      className={meldType === 'run' ? 'bg-blue-700' : ''}
                    >
                      Form Run
                    </Button>
                    {meldType && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={formMeld}
                        disabled={selectedCards.length < 3}
                      >
                        Meld Cards
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-center mb-4">
                {gameState.playerHand.map((card, index) => (
                  <div 
                    key={card.id} 
                    className={`h-36 w-24 bg-white rounded-md -ml-6 first:ml-0 cursor-pointer hover:translate-y-[-10px] transition-transform ${
                      selectedCards.includes(card.id) ? 'translate-y-[-15px] ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => toggleCardSelection(card.id)}
                  >
                    <div className={`p-2 h-full flex flex-col justify-between ${getCardColor(card.suit)}`}>
                      <div className="text-lg font-bold">{card.value}</div>
                      <div className="flex justify-center text-4xl">{getSuitSymbol(card.suit)}</div>
                      <div className="text-lg font-bold self-end">{card.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Action buttons */}
              <div className="flex justify-center">
                <Button
                  variant="primary"
                  onClick={discardCard}
                  disabled={selectedCards.length !== 1 || meldType !== null}
                  className="mx-2"
                >
                  Discard Selected Card
                </Button>
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
          
          {/* Game over message */}
          {gameState.gameOver && (
            <div className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-lg absolute inset-0 flex items-center justify-center">
              <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-8 rounded-xl shadow-2xl max-w-md text-center animate-modal-appear">
                <h2 className="text-3xl font-bold mb-4">
                  {gameState.winner === 0 ? 'Congratulations!' : 'Game Over!'}
                </h2>
                <p className="text-xl mb-6">
                  {gameState.winner === 0 
                    ? 'You won the game!' 
                    : `Player ${gameState.winner! + 1} has won the game.`}
                </p>
                <Button
                  variant="primary"
                  onClick={startNewGame}
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
        title="How to Play Rummy"
      >
        <div className="space-y-4 text-gray-300">
          <p>Rummy is a popular card matching game for 2-6 players.</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Each player is dealt 7 cards, with the remaining cards forming the draw pile</li>
            <li>On your turn, draw a card from either the deck or the discard pile</li>
            <li>Then discard one card to end your turn</li>
            <li>The goal is to form melds (sets or runs) with all your cards</li>
            <li>A set consists of 3 or 4 cards of the same rank but different suits</li>
            <li>A run consists of 3 or more consecutive cards of the same suit</li>
            <li>Jokers are wild and can be used to replace any card in a meld</li>
            <li>First player to use all their cards in valid melds wins</li>
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