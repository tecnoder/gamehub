'use client';

import { useState } from 'react';
import GameLayout from '@/components/games/GameLayout';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { FaDice, FaDiceOne, FaDiceTwo, FaDiceThree, FaDiceFour, FaDiceFive, FaDiceSix } from 'react-icons/fa';

// Score categories
const CATEGORIES = {
  ones: { display: 'Ones', description: 'Sum of all ones' },
  twos: { display: 'Twos', description: 'Sum of all twos' },
  threes: { display: 'Threes', description: 'Sum of all threes' },
  fours: { display: 'Fours', description: 'Sum of all fours' },
  fives: { display: 'Fives', description: 'Sum of all fives' },
  sixes: { display: 'Sixes', description: 'Sum of all sixes' },
  threeOfAKind: { display: 'Three of a Kind', description: 'Sum of all dice if 3+ of one value' },
  fourOfAKind: { display: 'Four of a Kind', description: 'Sum of all dice if 4+ of one value' },
  fullHouse: { display: 'Full House', description: '25 points for a three of a kind and a pair' },
  smallStraight: { display: 'Small Straight', description: '30 points for four sequential dice' },
  largeStraight: { display: 'Large Straight', description: '40 points for five sequential dice' },
  yahtzee: { display: 'Yahtzee', description: '50 points for five of a kind' },
  chance: { display: 'Chance', description: 'Sum of all dice' }
};

// Game state type
type YahtzeeGameState = {
  dice: number[];
  held: boolean[];
  scores: { [key: string]: number | null };
  rollsLeft: number;
  currentTurn: number;
  gameOver: boolean;
};

export default function YahtzeeGame() {
  // Initial game state
  const initialState: YahtzeeGameState = {
    dice: [1, 1, 1, 1, 1],
    held: [false, false, false, false, false],
    scores: Object.keys(CATEGORIES).reduce((acc, cat) => ({ ...acc, [cat]: null }), {}),
    rollsLeft: 3,
    currentTurn: 1,
    gameOver: false
  };

  const [gameState, setGameState] = useState<YahtzeeGameState>(initialState);
  const [showHelp, setShowHelp] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  // Roll dice
  const rollDice = () => {
    if (gameState.rollsLeft === 0 || gameState.gameOver) return;
    
    setIsRolling(true);
    
    // Simulated rolling animation
    const rollInterval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        dice: prev.dice.map((die, i) => prev.held[i] ? die : Math.floor(Math.random() * 6) + 1)
      }));
    }, 50);
    
    // Stop rolling after 500ms
    setTimeout(() => {
      clearInterval(rollInterval);
      setIsRolling(false);
      
      const newDice = gameState.dice.map((die, i) => 
        gameState.held[i] ? die : Math.floor(Math.random() * 6) + 1
      );
      
      setGameState(prev => ({
        ...prev,
        dice: newDice,
        rollsLeft: prev.rollsLeft - 1
      }));
    }, 500);
  };

  // Toggle hold on a die
  const toggleHold = (index: number) => {
    if (gameState.rollsLeft === 3 || gameState.rollsLeft === 0 || gameState.gameOver || isRolling) return;
    
    const newHeld = [...gameState.held];
    newHeld[index] = !newHeld[index];
    
    setGameState({
      ...gameState,
      held: newHeld
    });
  };

  // Score calculation functions
  const calculateScore = (category: string, dice: number[]): number => {
    // Count of each dice value
    const counts = dice.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const sum = dice.reduce((a, b) => a + b, 0);
    
    switch (category) {
      case 'ones': return (counts[1] || 0) * 1;
      case 'twos': return (counts[2] || 0) * 2;
      case 'threes': return (counts[3] || 0) * 3;
      case 'fours': return (counts[4] || 0) * 4;
      case 'fives': return (counts[5] || 0) * 5;
      case 'sixes': return (counts[6] || 0) * 6;
      case 'threeOfAKind': 
        return Object.values(counts).some(count => count >= 3) ? sum : 0;
      case 'fourOfAKind': 
        return Object.values(counts).some(count => count >= 4) ? sum : 0;
      case 'fullHouse': {
        const hasThree = Object.values(counts).some(count => count === 3);
        const hasTwo = Object.values(counts).some(count => count === 2);
        return (hasThree && hasTwo) ? 25 : 0;
      }
      case 'smallStraight': {
        const unique = Array.from(new Set(dice)).sort();
        if (
          (unique.includes(1) && unique.includes(2) && unique.includes(3) && unique.includes(4)) ||
          (unique.includes(2) && unique.includes(3) && unique.includes(4) && unique.includes(5)) ||
          (unique.includes(3) && unique.includes(4) && unique.includes(5) && unique.includes(6))
        ) {
          return 30;
        }
        return 0;
      }
      case 'largeStraight': {
        const sorted = [...dice].sort().join('');
        return (sorted === '12345' || sorted === '23456') ? 40 : 0;
      }
      case 'yahtzee': 
        return Object.values(counts).some(count => count === 5) ? 50 : 0;
      case 'chance': return sum;
      default: return 0;
    }
  };

  // Score a category
  const scoreCategory = (category: string) => {
    // Can't score a category that's already been scored
    if (gameState.scores[category] !== null || gameState.gameOver) return;
    
    const score = calculateScore(category, gameState.dice);
    const newScores = { ...gameState.scores, [category]: score };
    
    // Check if game is over
    const gameOver = Object.values(newScores).every(score => score !== null);
    
    setGameState({
      ...gameState,
      dice: [1, 1, 1, 1, 1],
      held: [false, false, false, false, false],
      scores: newScores,
      rollsLeft: 3,
      currentTurn: gameState.currentTurn + 1,
      gameOver
    });
  };

  // Calculate total score
  const calculateTotalScore = () => {
    const upperSection = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];
    
    let upperTotal = 0;
    upperSection.forEach(category => {
      if (gameState.scores[category] !== null) {
        upperTotal += gameState.scores[category] as number;
      }
    });
    
    // Bonus for upper section
    const upperBonus = upperTotal >= 63 ? 35 : 0;
    
    // Add up all scores
    let total = upperBonus;
    Object.entries(gameState.scores).forEach(([_, score]) => {
      if (score !== null) {
        total += score;
      }
    });
    
    return { upperTotal, upperBonus, total };
  };

  // Start a new game
  const newGame = () => {
    setGameState(initialState);
  };

  // Render a die
  const renderDie = (value: number, index: number) => {
    const diceIcons = [
      <FaDiceOne key={1} className="w-full h-full" />,
      <FaDiceTwo key={2} className="w-full h-full" />,
      <FaDiceThree key={3} className="w-full h-full" />,
      <FaDiceFour key={4} className="w-full h-full" />,
      <FaDiceFive key={5} className="w-full h-full" />,
      <FaDiceSix key={6} className="w-full h-full" />
    ];
    
    return (
      <div 
        key={index}
        className={`w-16 h-16 rounded-lg ${
          gameState.held[index] ? 'bg-yellow-500' : 'bg-white'
        } text-gray-900 flex items-center justify-center ${
          gameState.rollsLeft < 3 && gameState.rollsLeft > 0 && !gameState.gameOver
            ? 'cursor-pointer hover:shadow-lg transition-shadow'
            : ''
        } ${isRolling && !gameState.held[index] ? 'animate-roll' : ''}`}
        onClick={() => toggleHold(index)}
      >
        <div className="w-12 h-12">
          {diceIcons[value - 1]}
        </div>
      </div>
    );
  };

  // Get appropriate tooltip for a category
  const getCategoryTooltip = (category: string) => {
    if (gameState.scores[category] !== null) {
      return `Scored: ${gameState.scores[category]} points`;
    }
    
    if (gameState.rollsLeft === 3) {
      return 'Roll dice first';
    }
    
    const potentialScore = calculateScore(category, gameState.dice);
    return `Potential score: ${potentialScore} points`;
  };

  // Calculate totals
  const { upperTotal, upperBonus, total } = calculateTotalScore();

  return (
    <>
      <GameLayout
        title="Yahtzee"
        gameInfo={{
          currentPlayer: 'You',
          status: gameState.gameOver ? 'finished' : 'playing',
          moveCount: gameState.currentTurn,
        }}
        onShowHelp={() => setShowHelp(true)}
      >
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full max-w-6xl mx-auto">
          {/* Game board */}
          <div className="w-full lg:w-2/3 bg-green-800 rounded-lg shadow-lg p-6">
            {/* Dice area */}
            <div className="mb-8">
              <div className="flex justify-center gap-4 mb-4">
                {gameState.dice.map((die, index) => renderDie(die, index))}
              </div>
              <div className="flex justify-center">
                <Button 
                  variant="primary" 
                  onClick={rollDice}
                  disabled={gameState.rollsLeft === 0 || gameState.gameOver || isRolling}
                  className="w-40"
                >
                  {gameState.rollsLeft === 3 ? 'Roll Dice' : `Roll Again (${gameState.rollsLeft})`}
                </Button>
              </div>
            </div>
            
            {/* Score card */}
            <div className="bg-white rounded-lg text-gray-900 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="px-4 py-2 w-32 text-center">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Upper section */}
                  <tr className="bg-gray-100">
                    <td colSpan={2} className="px-4 py-1 font-bold">Upper Section</td>
                  </tr>
                  {['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'].map(category => (
                    <tr key={category} className="border-t">
                      <td className="px-4 py-2 flex items-center">
                        <div className="group relative">
                          <span>{CATEGORIES[category as keyof typeof CATEGORIES].display}</span>
                          <div className="hidden group-hover:block absolute left-0 top-full z-10 bg-gray-800 text-white text-xs p-2 rounded w-48">
                            {CATEGORIES[category as keyof typeof CATEGORIES].description}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center">
                        {gameState.scores[category] !== null ? (
                          <span>{gameState.scores[category]}</span>
                        ) : (
                          <button
                            className="w-full py-1 px-2 rounded bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => scoreCategory(category)}
                            disabled={gameState.rollsLeft === 3}
                            title={getCategoryTooltip(category)}
                          >
                            Score
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t bg-gray-100">
                    <td className="px-4 py-2 font-medium">Upper Bonus (63+)</td>
                    <td className="px-4 py-2 text-center font-medium">
                      {upperBonus > 0 ? upperBonus : (upperTotal >= 63 ? upperBonus : `${upperTotal}/63`)}
                    </td>
                  </tr>
                  
                  {/* Lower section */}
                  <tr className="bg-gray-100">
                    <td colSpan={2} className="px-4 py-1 font-bold">Lower Section</td>
                  </tr>
                  {['threeOfAKind', 'fourOfAKind', 'fullHouse', 'smallStraight', 'largeStraight', 'yahtzee', 'chance'].map(category => (
                    <tr key={category} className="border-t">
                      <td className="px-4 py-2 flex items-center">
                        <div className="group relative">
                          <span>{CATEGORIES[category as keyof typeof CATEGORIES].display}</span>
                          <div className="hidden group-hover:block absolute left-0 top-full z-10 bg-gray-800 text-white text-xs p-2 rounded w-48">
                            {CATEGORIES[category as keyof typeof CATEGORIES].description}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center">
                        {gameState.scores[category] !== null ? (
                          <span>{gameState.scores[category]}</span>
                        ) : (
                          <button
                            className="w-full py-1 px-2 rounded bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => scoreCategory(category)}
                            disabled={gameState.rollsLeft === 3}
                            title={getCategoryTooltip(category)}
                          >
                            Score
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  
                  {/* Total score */}
                  <tr className="border-t bg-gray-200">
                    <td className="px-4 py-2 font-bold">TOTAL SCORE</td>
                    <td className="px-4 py-2 text-center font-bold">{total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Game controls and info */}
          <div className="w-full lg:w-1/3 space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-2">Game Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Turn:</span>
                  <span>{gameState.currentTurn}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rolls Left:</span>
                  <span>{gameState.rollsLeft}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Score:</span>
                  <span>{total}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg shadow">
              <Button 
                variant="secondary" 
                onClick={newGame}
                fullWidth
              >
                New Game
              </Button>
            </div>
            
            {gameState.gameOver && (
              <div className="bg-green-700/80 backdrop-blur-sm p-4 rounded-lg text-center animate-modal-appear">
                <h3 className="text-xl font-bold mb-2">Game Over!</h3>
                <p className="mb-4">Final score: {total} points</p>
                <Button 
                  variant="primary" 
                  onClick={newGame}
                >
                  Play Again
                </Button>
              </div>
            )}
          </div>
        </div>
      </GameLayout>

      <Modal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title="How to Play Yahtzee"
      >
        <div className="space-y-4 text-gray-300">
          <p>Yahtzee is a classic dice game where you roll five dice to make various combinations.</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Each turn you can roll the dice up to 3 times</li>
            <li>After the first roll, you may hold any dice and reroll the others</li>
            <li>You must score in exactly one category each turn</li>
            <li>Each category can only be scored once per game</li>
            <li>The game ends when all categories are filled</li>
            <li>If you score 63+ points in the upper section, you get a 35 point bonus</li>
          </ul>
          <p className="font-medium mt-4">Scoring Categories:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Ones, Twos, etc: Sum of the specified number</li>
            <li>Three of a Kind: Sum of all dice (if you have 3+ of one value)</li>
            <li>Four of a Kind: Sum of all dice (if you have 4+ of one value)</li>
            <li>Full House: 25 points (for three of one number and two of another)</li>
            <li>Small Straight: 30 points (for four sequential dice)</li>
            <li>Large Straight: 40 points (for five sequential dice)</li>
            <li>Yahtzee: 50 points (for five of a kind)</li>
            <li>Chance: Sum of all dice (score anything here)</li>
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