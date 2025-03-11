'use client';

import { useState, useEffect } from 'react';
import GameLayout from '@/components/games/GameLayout';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

// Chess piece mappings
const PIECES: Record<string, string> = {
  'k': '♚', // black king
  'q': '♛', // black queen
  'r': '♜', // black rook
  'b': '♝', // black bishop
  'n': '♞', // black knight
  'p': '♟', // black pawn
  'K': '♔', // white king
  'Q': '♕', // white queen
  'R': '♖', // white rook
  'B': '♗', // white bishop
  'N': '♘', // white knight
  'P': '♙', // white pawn
};

// SVG paths for chess pieces
const PIECE_IMAGES: Record<string, string> = {
  'k': '/images/chess/black-king.svg',
  'q': '/images/chess/black-queen.svg',
  'r': '/images/chess/black-rook.svg',
  'b': '/images/chess/black-bishop.svg',
  'n': '/images/chess/black-knight.svg',
  'p': '/images/chess/black-pawn.svg',
  'K': '/images/chess/white-king.svg',
  'Q': '/images/chess/white-queen.svg',
  'R': '/images/chess/white-rook.svg',
  'B': '/images/chess/white-bishop.svg',
  'N': '/images/chess/white-knight.svg',
  'P': '/images/chess/white-pawn.svg',
};

// Placeholder for actual chess game logic
type ChessGameState = {
  board: string[][];
  currentPlayer: 'white' | 'black';
  moveHistory: string[];
  gameStatus: 'playing' | 'checkmate' | 'stalemate' | 'draw';
  selectedPiece: [number, number] | null;
  possibleMoves: [number, number][];
  capturedPieces: {white: string[], black: string[]};
};

const initialBoard: string[][] = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  Array(8).fill(''),
  Array(8).fill(''),
  Array(8).fill(''),
  Array(8).fill(''),
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
];

export default function ChessGame() {
  const [gameState, setGameState] = useState<ChessGameState>({
    board: initialBoard,
    currentPlayer: 'white',
    moveHistory: [],
    gameStatus: 'playing',
    selectedPiece: null,
    possibleMoves: [],
    capturedPieces: {white: [], black: []},
  });
  const [showHelp, setShowHelp] = useState(false);
  const [isPieceAnimating, setIsPieceAnimating] = useState(false);
  const [lastMove, setLastMove] = useState<{from: [number, number], to: [number, number]} | null>(null);

  // Get possible moves for a piece (simplified for demo purposes)
  const getPossibleMoves = (row: number, col: number, board: string[][]) => {
    const piece = board[row][col];
    if (!piece) return [];
    
    // This is a simplified version - a real chess game would have full rules implementation
    const moves: [number, number][] = [];
    const isWhite = piece === piece.toUpperCase();
    
    // Example: Pawns can move forward one square (or two from starting position)
    if (piece.toLowerCase() === 'p') {
      const direction = isWhite ? -1 : 1;
      const startRow = isWhite ? 6 : 1;
      
      // Move forward one square
      if (row + direction >= 0 && row + direction < 8 && !board[row + direction][col]) {
        moves.push([row + direction, col]);
        
        // Move forward two squares from starting position
        if (row === startRow && !board[row + 2 * direction][col]) {
          moves.push([row + 2 * direction, col]);
        }
      }
      
      // Capture diagonally
      for (const diagCol of [col - 1, col + 1]) {
        if (diagCol >= 0 && diagCol < 8 && 
            row + direction >= 0 && row + direction < 8 && 
            board[row + direction][diagCol] && 
            isOpponent(piece, board[row + direction][diagCol])) {
          moves.push([row + direction, diagCol]);
        }
      }
    }
    
    // This is where you would add move logic for other pieces
    // For demo purposes, we'll allow other pieces to move around freely
    if (piece.toLowerCase() !== 'p') {
      // Get all empty squares or squares with opponent pieces
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if ([r, c].join() !== [row, col].join() && 
              (!board[r][c] || isOpponent(piece, board[r][c]))) {
            // In a real game, we would check if the move is valid based on piece type
            // For demo, just add all potential squares
            if (Math.abs(r - row) <= 2 && Math.abs(c - col) <= 2) {
              moves.push([r, c]);
            }
          }
        }
      }
    }
    
    return moves;
  };
  
  const isOpponent = (piece1: string, piece2: string) => {
    return (piece1 === piece1.toUpperCase()) !== (piece2 === piece2.toUpperCase());
  };

  const handleCellClick = (row: number, col: number) => {
    const piece = gameState.board[row][col];
    
    // If no piece is already selected
    if (!gameState.selectedPiece) {
      // If clicked on an empty cell
      if (!piece) return;
      
      // If clicked on opponent's piece
      const pieceColor = getPieceColor(piece);
      if (pieceColor !== gameState.currentPlayer) return;
      
      // Valid piece selection
      const possibleMoves = getPossibleMoves(row, col, gameState.board);
      setGameState({
        ...gameState, 
        selectedPiece: [row, col],
        possibleMoves
      });
    } else {
      const [selectedRow, selectedCol] = gameState.selectedPiece;
      const selectedPiece = gameState.board[selectedRow][selectedCol];
      
      // If clicking on the same piece, deselect it
      if (row === selectedRow && col === selectedCol) {
        setGameState({
          ...gameState,
          selectedPiece: null,
          possibleMoves: []
        });
        return;
      }
      
      // If clicking on another own piece, select it instead
      if (piece && getPieceColor(piece) === getPieceColor(selectedPiece)) {
        const possibleMoves = getPossibleMoves(row, col, gameState.board);
        setGameState({
          ...gameState,
          selectedPiece: [row, col],
          possibleMoves
        });
        return;
      }
      
      // Check if the move is valid
      const isValidMove = gameState.possibleMoves.some(
        ([r, c]) => r === row && c === col
      );
      
      if (!isValidMove) return;
      
      // Make the move
      const newBoard = gameState.board.map(row => [...row]);
      
      // Check if a piece was captured
      const capturedPieces = {...gameState.capturedPieces};
      if (newBoard[row][col]) {
        const capturedPiece = newBoard[row][col];
        const captureColor = getPieceColor(capturedPiece) === 'white' ? 'white' : 'black';
        capturedPieces[captureColor] = [...capturedPieces[captureColor], capturedPiece];
      }
      
      // Update the board
      newBoard[row][col] = selectedPiece;
      newBoard[selectedRow][selectedCol] = '';
      
      // Add move to history
      const moveNotation = `${selectedPiece}${String.fromCharCode(97 + selectedCol)}${8 - selectedRow} to ${String.fromCharCode(97 + col)}${8 - row}`;
      
      // Animate the piece
      setIsPieceAnimating(true);
      setLastMove({from: [selectedRow, selectedCol], to: [row, col]});
      
      setTimeout(() => {
        setIsPieceAnimating(false);
        
        // Switch player
        setGameState({
          board: newBoard,
          currentPlayer: gameState.currentPlayer === 'white' ? 'black' : 'white',
          moveHistory: [...gameState.moveHistory, moveNotation],
          gameStatus: gameState.gameStatus, // In a real game, we would check for checkmate here
          selectedPiece: null,
          possibleMoves: [],
          capturedPieces
        });
      }, 300);
    }
  };

  const handleUndo = () => {
    if (gameState.moveHistory.length === 0) return;
    
    // In a real game, we would implement proper undo functionality
    console.log('Undo move');
  };

  const handleRedo = () => {
    // In a real game, we would implement proper redo functionality
    console.log('Redo move');
  };

  const getPieceColor = (piece: string) => {
    return piece === piece.toUpperCase() ? 'white' : 'black';
  };

  return (
    <>
      <GameLayout
        title="Chess"
        gameInfo={{
          currentPlayer: gameState.currentPlayer,
          status: gameState.gameStatus,
          moveCount: gameState.moveHistory.length,
        }}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onShowHelp={() => setShowHelp(true)}
      >
        <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start w-full max-w-6xl mx-auto">
          {/* Chess board */}
          <div className="aspect-square w-full max-w-2xl mx-auto flex-shrink-0">
            <div className="grid grid-cols-8 gap-1 h-full shadow-lg rounded-md overflow-hidden">
              {gameState.board.map((row, rowIndex) =>
                row.map((piece, colIndex) => {
                  const isBlackSquare = (rowIndex + colIndex) % 2 === 1;
                  const isSelected = gameState.selectedPiece?.[0] === rowIndex && gameState.selectedPiece?.[1] === colIndex;
                  const isPossibleMove = gameState.possibleMoves.some(([r, c]) => r === rowIndex && c === colIndex);
                  const isLastMoveFrom = lastMove?.from[0] === rowIndex && lastMove?.from[1] === colIndex;
                  const isLastMoveTo = lastMove?.to[0] === rowIndex && lastMove?.to[1] === colIndex;

                  return (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                        aspect-square w-full flex items-center justify-center relative
                        ${isBlackSquare ? 'bg-gray-600' : 'bg-gray-400'}
                        ${isSelected ? 'ring-2 ring-yellow-400' : ''}
                        ${isPossibleMove ? 'ring-2 ring-blue-400' : ''}
                        ${isLastMoveFrom ? 'bg-blue-900/50' : ''}
                        ${isLastMoveTo ? 'bg-blue-700/50' : ''}
                        hover:ring-2 hover:ring-blue-400 transition-all
                      `}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    >
                      {piece && (
                        <div 
                          className={`chess-piece ${isPieceAnimating && isLastMoveTo ? 'animate-bounce' : ''}`}
                          style={{
                            backgroundImage: `url('${PIECE_IMAGES[piece]}')`
                          }}
                        />
                      )}
                      {/* Coordinate labels */}
                      {colIndex === 0 && (
                        <span className="absolute top-0 left-1 text-xs font-bold text-gray-800">
                          {8 - rowIndex}
                        </span>
                      )}
                      {rowIndex === 7 && (
                        <span className="absolute bottom-0 right-1 text-xs font-bold text-gray-800">
                          {String.fromCharCode(97 + colIndex)}
                        </span>
                      )}
                      {/* Show possible move indicator */}
                      {isPossibleMove && !piece && (
                        <div className="w-3 h-3 rounded-full bg-blue-400 opacity-70"></div>
                      )}
                      {isPossibleMove && piece && (
                        <div className="absolute inset-0 ring-2 ring-red-500 opacity-70 rounded-sm"></div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
          
          {/* Game information */}
          <div className="w-full max-w-md space-y-6">
            {/* Current player */}
            <div className="bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-2">Current Turn</h3>
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full ${gameState.currentPlayer === 'white' ? 'bg-white' : 'bg-black'}`}></div>
                <span className="text-xl font-bold capitalize">{gameState.currentPlayer}</span>
              </div>
            </div>
            
            {/* Captured pieces */}
            <div className="bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-2">Captured Pieces</h3>
              <div className="flex justify-between">
                <div>
                  <h4 className="text-sm text-gray-400 mb-1">White</h4>
                  <div className="flex flex-wrap gap-1">
                    {gameState.capturedPieces.white.map((piece, i) => (
                      <div 
                        key={`white-captured-${i}`}
                        className="w-8 h-8 flex items-center justify-center"
                        style={{
                          backgroundImage: `url('${PIECE_IMAGES[piece]}')`,
                          backgroundSize: 'contain',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm text-gray-400 mb-1">Black</h4>
                  <div className="flex flex-wrap gap-1">
                    {gameState.capturedPieces.black.map((piece, i) => (
                      <div 
                        key={`black-captured-${i}`}
                        className="w-8 h-8 flex items-center justify-center"
                        style={{
                          backgroundImage: `url('${PIECE_IMAGES[piece]}')`,
                          backgroundSize: 'contain',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Move history */}
            <div className="bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-2">Move History</h3>
              <div className="max-h-60 overflow-y-auto space-y-1 p-2">
                {gameState.moveHistory.length === 0 ? (
                  <p className="text-gray-400 italic">No moves yet</p>
                ) : (
                  gameState.moveHistory.map((move, i) => (
                    <div key={i} className="flex">
                      <span className="text-gray-400 w-8">{i+1}.</span>
                      <span>{move}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </GameLayout>

      <Modal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title="How to Play Chess"
      >
        <div className="space-y-4 text-gray-300">
          <p>Chess is a classic strategy board game played between two players.</p>
          <ul className="list-disc list-inside space-y-2">
            <li>White moves first, then players alternate turns</li>
            <li>Each piece type has its own unique way of moving</li>
            <li>Capture opponent's pieces by moving onto their square</li>
            <li>The goal is to checkmate the opponent's king</li>
          </ul>
          <p className="font-medium mt-4">Piece Movements:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Pawn: Moves forward 1 square, or 2 on first move. Captures diagonally.</li> 
            <li>Rook: Moves any number of squares horizontally or vertically</li>
            <li>Knight: Moves in an L-shape (2 squares in one direction, then 1 square perpendicular)</li>
            <li>Bishop: Moves any number of squares diagonally</li>
            <li>Queen: Combines the power of rook and bishop</li>
            <li>King: Moves one square in any direction</li>
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