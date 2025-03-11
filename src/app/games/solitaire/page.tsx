'use client';

import { useState } from 'react';
import GameLayout from '@/components/games/GameLayout';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

// Card suits and values
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Card type definition
type Card = {
  suit: string;
  value: string;
  color: 'red' | 'black';
  faceUp: boolean;
};

// Game state type
type SolitaireGameState = {
  stock: Card[];
  waste: Card[];
  foundations: {
    hearts: Card[];
    diamonds: Card[];
    clubs: Card[];
    spades: Card[];
  };
  tableaus: Card[][];
  selectedCard: {
    location: 'stock' | 'waste' | 'foundation' | 'tableau';
    pile: number | string;
    index: number;
  } | null;
  moves: number;
  status: 'playing' | 'won';
};

export default function SolitaireGame() {
  // Create initial game state
  const createInitialState = (): SolitaireGameState => {
    // Create and shuffle deck
    const deck: Card[] = [];
    for (const suit of SUITS) {
      for (const value of VALUES) {
        deck.push({
          suit,
          value,
          color: suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black',
          faceUp: false
        });
      }
    }
    
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    // Set up tableaus
    const tableaus: Card[][] = Array(7).fill(null).map((_, i) => {
      const cards = deck.splice(0, i + 1);
      cards[cards.length - 1].faceUp = true; // Flip the top card
      return cards;
    });
    
    // Remaining cards go to stock
    const stock = deck.map(card => ({ ...card, faceUp: false }));
    
    return {
      stock,
      waste: [],
      foundations: {
        hearts: [],
        diamonds: [],
        clubs: [],
        spades: []
      },
      tableaus,
      selectedCard: null,
      moves: 0,
      status: 'playing'
    };
  };

  const [gameState, setGameState] = useState<SolitaireGameState>(createInitialState());
  const [showHelp, setShowHelp] = useState(false);

  // Draw from stock to waste
  const drawFromStock = () => {
    if (gameState.stock.length === 0) {
      // When stock is empty, recycle waste
      if (gameState.waste.length === 0) return;
      
      setGameState({
        ...gameState,
        stock: [...gameState.waste].reverse().map(card => ({ ...card, faceUp: false })),
        waste: [],
        moves: gameState.moves + 1
      });
    } else {
      // Draw one card from stock to waste
      const newStock = [...gameState.stock];
      const card = newStock.pop();
      if (!card) return;
      
      card.faceUp = true;
      
      setGameState({
        ...gameState,
        stock: newStock,
        waste: [...gameState.waste, card],
        moves: gameState.moves + 1
      });
    }
  };

  // Card selection logic
  const selectCard = (location: 'stock' | 'waste' | 'foundation' | 'tableau', pile: number | string, index: number) => {
    // Can't select cards from stock
    if (location === 'stock') return;
    
    // Can only select face-up cards
    let card: Card | undefined;
    if (location === 'waste') {
      card = gameState.waste[gameState.waste.length - 1];
    } else if (location === 'foundation') {
      const foundation = gameState.foundations[pile as keyof typeof gameState.foundations];
      card = foundation[foundation.length - 1];
    } else if (location === 'tableau') {
      const tableau = gameState.tableaus[pile as number];
      card = tableau[index];
      if (!card?.faceUp) return;
    }
    
    if (!card) return;
    
    // If a card is already selected, try to move it
    if (gameState.selectedCard) {
      moveCard(location, pile, index);
      return;
    }
    
    // Otherwise, select this card
    setGameState({
      ...gameState,
      selectedCard: { location, pile, index }
    });
  };

  // Move card logic
  const moveCard = (targetLocation: 'stock' | 'waste' | 'foundation' | 'tableau', targetPile: number | string, targetIndex: number) => {
    if (!gameState.selectedCard) return;
    
    const { location, pile, index } = gameState.selectedCard;
    
    // Get the card(s) being moved
    let cardsToMove: Card[] = [];
    let sourceCards: Card[] = [];
    
    if (location === 'waste') {
      if (gameState.waste.length === 0) return;
      cardsToMove = [gameState.waste[gameState.waste.length - 1]];
      sourceCards = [...gameState.waste.slice(0, -1)];
    } else if (location === 'foundation') {
      const foundation = gameState.foundations[pile as keyof typeof gameState.foundations];
      if (foundation.length === 0) return;
      cardsToMove = [foundation[foundation.length - 1]];
      sourceCards = [...foundation.slice(0, -1)];
    } else if (location === 'tableau') {
      const tableau = gameState.tableaus[pile as number];
      if (index >= tableau.length) return;
      cardsToMove = tableau.slice(index);
      sourceCards = tableau.slice(0, index);
    }
    
    // Check if the move is valid
    let isValidMove = false;
    let targetCards: Card[] = [];
    
    if (targetLocation === 'foundation') {
      const foundation = gameState.foundations[targetPile as keyof typeof gameState.foundations];
      // Can only move one card at a time to foundation
      if (cardsToMove.length !== 1) return;
      
      const card = cardsToMove[0];
      // For an empty foundation, can only place an ace
      if (foundation.length === 0) {
        isValidMove = card.value === 'A';
      } else {
        const topCard = foundation[foundation.length - 1];
        // Must be same suit and next value
        isValidMove = card.suit === topCard.suit && 
                       VALUES.indexOf(card.value) === VALUES.indexOf(topCard.value) + 1;
      }
      
      if (isValidMove) {
        targetCards = [...foundation, ...cardsToMove];
      }
    } else if (targetLocation === 'tableau') {
      const tableau = gameState.tableaus[targetPile as number];
      
      // For an empty tableau, can only place a king
      if (tableau.length === 0) {
        isValidMove = cardsToMove[0].value === 'K';
      } else {
        const topCard = tableau[tableau.length - 1];
        // Must be opposite color and one value lower
        isValidMove = cardsToMove[0].color !== topCard.color && 
                       VALUES.indexOf(cardsToMove[0].value) === VALUES.indexOf(topCard.value) - 1;
      }
      
      if (isValidMove) {
        targetCards = [...tableau, ...cardsToMove];
      }
    }
    
    if (!isValidMove) {
      // Deselect if invalid move
      setGameState({
        ...gameState,
        selectedCard: null
      });
      return;
    }
    
    // Update game state with the move
    const newState = { ...gameState, selectedCard: null, moves: gameState.moves + 1 };
    
    if (location === 'waste') {
      newState.waste = sourceCards;
    } else if (location === 'foundation') {
      newState.foundations = {
        ...newState.foundations,
        [pile]: sourceCards
      };
    } else if (location === 'tableau') {
      newState.tableaus = [...newState.tableaus];
      newState.tableaus[pile as number] = sourceCards;
      
      // Flip the card below if needed
      if (sourceCards.length > 0 && !sourceCards[sourceCards.length - 1].faceUp) {
        sourceCards[sourceCards.length - 1].faceUp = true;
      }
    }
    
    if (targetLocation === 'foundation') {
      newState.foundations = {
        ...newState.foundations,
        [targetPile]: targetCards
      };
      
      // Check for win condition
      const isGameWon = Object.values(newState.foundations).every(
        foundation => foundation.length === 13
      );
      
      if (isGameWon) {
        newState.status = 'won';
      }
    } else if (targetLocation === 'tableau') {
      newState.tableaus = [...newState.tableaus];
      newState.tableaus[targetPile as number] = targetCards;
    }
    
    setGameState(newState);
  };

  // Auto complete game when all cards are face up
  const autoComplete = () => {
    // Check if all cards are face up
    const allFaceUp = gameState.tableaus.every(tableau => 
      tableau.every(card => card.faceUp)
    ) && gameState.stock.length === 0;
    
    if (!allFaceUp) return;
    
    // Auto move all cards to foundations
    // This is simplified - in a real game we'd need to check if moves are valid
    setGameState({
      ...gameState,
      foundations: {
        hearts: Array(13).fill(null).map((_, i) => ({
          suit: 'hearts',
          value: VALUES[i],
          color: 'red',
          faceUp: true
        })),
        diamonds: Array(13).fill(null).map((_, i) => ({
          suit: 'diamonds',
          value: VALUES[i],
          color: 'red',
          faceUp: true
        })),
        clubs: Array(13).fill(null).map((_, i) => ({
          suit: 'clubs',
          value: VALUES[i],
          color: 'black',
          faceUp: true
        })),
        spades: Array(13).fill(null).map((_, i) => ({
          suit: 'spades',
          value: VALUES[i],
          color: 'black',
          faceUp: true
        }))
      },
      tableaus: Array(7).fill([]),
      stock: [],
      waste: [],
      status: 'won'
    });
  };

  // Start a new game
  const newGame = () => {
    setGameState(createInitialState());
  };

  // Render card
  const renderCard = (card?: Card, isSelected = false) => {
    if (!card) {
      return (
        <div className="w-16 h-24 rounded-md bg-gray-700 border border-gray-600 flex items-center justify-center">
          <div className="text-gray-500 text-xs">Empty</div>
        </div>
      );
    }
    
    if (!card.faceUp) {
      return (
        <div className="w-16 h-24 rounded-md bg-blue-600 border border-gray-600 cursor-pointer shadow-sm animate-shimmer">
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 rounded-md p-2">
            <div className="w-full h-full border-2 border-dashed border-white/30 rounded-sm"></div>
          </div>
        </div>
      );
    }
    
    return (
      <div 
        className={`w-16 h-24 rounded-md bg-white border ${
          isSelected ? 'border-yellow-400 ring-2 ring-yellow-400' : 'border-gray-300'
        } shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
      >
        <div className="flex flex-col h-full p-1">
          <div className={`text-xs font-bold ${card.color === 'red' ? 'text-red-600' : 'text-gray-900'}`}>
            {card.value}
          </div>
          <div className="flex-grow flex items-center justify-center">
            <div className={`text-2xl ${card.color === 'red' ? 'text-red-600' : 'text-gray-900'}`}>
              {card.suit === 'hearts' ? '♥' : 
               card.suit === 'diamonds' ? '♦' : 
               card.suit === 'clubs' ? '♣' : '♠'}
            </div>
          </div>
          <div className={`text-xs font-bold self-end ${card.color === 'red' ? 'text-red-600' : 'text-gray-900'}`}>
            {card.value}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <GameLayout
        title="Solitaire"
        gameInfo={{
          currentPlayer: 'You',
          status: gameState.status,
          moveCount: gameState.moves,
        }}
        onShowHelp={() => setShowHelp(true)}
      >
        <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
          {/* Game board */}
          <div className="bg-green-800 rounded-lg shadow-xl p-6">
            {/* Top row: Stock, Waste, and Foundations */}
            <div className="flex gap-4 mb-6">
              {/* Stock */}
              <div className="flex gap-2">
                <div 
                  className="cursor-pointer"
                  onClick={drawFromStock}
                >
                  {gameState.stock.length > 0 ? (
                    renderCard(gameState.stock[gameState.stock.length - 1])
                  ) : (
                    <div className="w-16 h-24 rounded-md border border-gray-300 border-dashed flex items-center justify-center bg-gray-700/50">
                      <div className="text-gray-300 text-xs">Click to<br/>recycle</div>
                    </div>
                  )}
                </div>
                
                {/* Waste */}
                <div 
                  className="cursor-pointer"
                  onClick={() => {
                    if (gameState.waste.length > 0) {
                      selectCard('waste', 0, gameState.waste.length - 1);
                    }
                  }}
                >
                  {gameState.waste.length > 0 ? (
                    renderCard(
                      gameState.waste[gameState.waste.length - 1], 
                      gameState.selectedCard?.location === 'waste'
                    )
                  ) : (
                    <div className="w-16 h-24 rounded-md border border-gray-300 border-dashed bg-gray-700/50"></div>
                  )}
                </div>
              </div>
              
              <div className="flex-grow"></div>
              
              {/* Foundations */}
              <div className="flex gap-2">
                {SUITS.map(suit => (
                  <div 
                    key={suit}
                    className="cursor-pointer"
                    onClick={() => {
                      const foundation = gameState.foundations[suit as keyof typeof gameState.foundations];
                      if (foundation.length > 0) {
                        selectCard('foundation', suit, foundation.length - 1);
                      } else if (gameState.selectedCard) {
                        moveCard('foundation', suit, 0);
                      }
                    }}
                  >
                    {gameState.foundations[suit as keyof typeof gameState.foundations].length > 0 ? (
                      renderCard(
                        gameState.foundations[suit as keyof typeof gameState.foundations][
                          gameState.foundations[suit as keyof typeof gameState.foundations].length - 1
                        ],
                        gameState.selectedCard?.location === 'foundation' && gameState.selectedCard.pile === suit
                      )
                    ) : (
                      <div className="w-16 h-24 rounded-md border border-gray-300 border-dashed flex items-center justify-center bg-gray-700/50">
                        <div className={`text-2xl ${
                          suit === 'hearts' || suit === 'diamonds' ? 'text-red-400' : 'text-gray-300'
                        }`}>
                          {suit === 'hearts' ? '♥' : 
                           suit === 'diamonds' ? '♦' : 
                           suit === 'clubs' ? '♣' : '♠'}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Tableau */}
            <div className="flex gap-2 justify-between">
              {gameState.tableaus.map((tableau, pileIndex) => (
                <div key={`tableau-${pileIndex}`} className="min-h-[300px] flex flex-col">
                  {tableau.length > 0 ? (
                    tableau.map((card, cardIndex) => (
                      <div 
                        key={`${pileIndex}-${cardIndex}`}
                        className={`-mt-16 first:mt-0 ${
                          gameState.selectedCard?.location === 'tableau' && 
                          gameState.selectedCard.pile === pileIndex &&
                          cardIndex >= gameState.selectedCard.index ? 'z-10' : 'z-0'
                        }`}
                        onClick={() => {
                          if (card.faceUp) {
                            selectCard('tableau', pileIndex, cardIndex);
                          }
                        }}
                      >
                        {renderCard(
                          card,
                          gameState.selectedCard?.location === 'tableau' && 
                          gameState.selectedCard.pile === pileIndex &&
                          cardIndex >= gameState.selectedCard.index
                        )}
                      </div>
                    ))
                  ) : (
                    <div 
                      className="cursor-pointer"
                      onClick={() => {
                        if (gameState.selectedCard) {
                          moveCard('tableau', pileIndex, 0);
                        }
                      }}
                    >
                      <div className="w-16 h-24 rounded-md border border-gray-300 border-dashed bg-gray-700/50"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Game controls */}
          <div className="flex gap-4">
            <Button 
              variant="primary" 
              onClick={drawFromStock}
              className="flex-1"
            >
              Draw Card
            </Button>
            <Button 
              variant="secondary" 
              onClick={autoComplete}
              className="flex-1"
              disabled={gameState.status === 'won'}
            >
              Auto Complete
            </Button>
            <Button 
              variant="secondary" 
              onClick={newGame}
              className="flex-1"
            >
              New Game
            </Button>
          </div>
          
          {/* Game won message */}
          {gameState.status === 'won' && (
            <div className="bg-green-700/80 backdrop-blur-sm p-4 rounded-lg text-center animate-modal-appear">
              <h3 className="text-xl font-bold mb-2">Congratulations!</h3>
              <p className="mb-4">You've won the game in {gameState.moves} moves!</p>
              <Button 
                variant="primary" 
                onClick={newGame}
              >
                Play Again
              </Button>
            </div>
          )}
        </div>
      </GameLayout>

      <Modal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title="How to Play Solitaire"
      >
        <div className="space-y-4 text-gray-300">
          <p>Solitaire is a single-player card game.</p>
          <ul className="list-disc list-inside space-y-2">
            <li>The goal is to move all cards to the four foundation piles, sorted by suit and rank</li>
            <li>Each foundation must be built up from Ace to King of the same suit</li>
            <li>Tableau piles must be built down in alternating colors</li>
            <li>You can move multiple cards at once if they are in sequence</li>
            <li>Empty tableau spots can only be filled with Kings</li>
            <li>Click the stock pile to draw cards to the waste pile</li>
            <li>When the stock is empty, click to recycle the waste cards back to the stock</li>
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