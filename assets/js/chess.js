/* DRAG0N CHESS VS AI ENGINE (2026) */
(function() {
  // Piece values for evaluation
  const PIECE_VALUES = {
    'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000,
    'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900, 'K': 20000
  };

  // Piece symbols map
  const PIECE_SYMBOLS = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
  };

  // Positional evaluation tables (Piece-Square Tables)
  const pawnPST = [
    [ 0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [ 5,  5, 10, 27, 27, 10,  5,  5],
    [ 0,  0,  0, 25, 25,  0,  0,  0],
    [ 5, -5,-10,  0,  0,-10, -5,  5],
    [ 5, 10, 10,-25,-25, 10, 10,  5],
    [ 0,  0,  0,  0,  0,  0,  0,  0]
  ];

  const knightPST = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ];

  const bishopPST = [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ];

  const rookPST = [
    [ 0,  0,  0,  0,  0,  0,  0,  0],
    [ 5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [ 0,  0,  0,  5,  5,  0,  0,  0]
  ];

  const queenPST = [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [ -5,  0,  5,  5,  5,  5,  0, -5],
    [  0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ];

  const kingPST = [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [ 20, 20,  0,  0,  0,  0, 20, 20],
    [ 20, 30, 10,  0,  0, 10, 30, 20]
  ];

  // Game state
  let board = [];
  let turn = 'w'; // 'w' (White/Player) or 'b' (Black/AI)
  let playerColor = 'w';
  let aiColor = 'b';
  let selectedSquare = null;
  let legalMoves = [];
  let moveHistory = [];
  let capturedWhite = [];
  let capturedBlack = [];
  let isGameOver = false;
  let aiDifficulty = 'medium'; // 'easy', 'medium', 'hard'

  function initBoard() {
    board = [
      ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
      ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
      ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];
    turn = 'w';
    selectedSquare = null;
    legalMoves = [];
    moveHistory = [];
    capturedWhite = [];
    capturedBlack = [];
    isGameOver = false;
    renderBoard();
    updateStatus();
    if (turn === aiColor) {
      setTimeout(makeAIMove, 400);
    }
  }

  function isWhite(piece) {
    return piece && piece === piece.toUpperCase();
  }

  function isBlack(piece) {
    return piece && piece === piece.toLowerCase();
  }

  function isSameColor(piece1, piece2) {
    if (!piece1 || !piece2) return false;
    return (isWhite(piece1) && isWhite(piece2)) || (isBlack(piece1) && isBlack(piece2));
  }

  function getRawMoves(bd, r, c) {
    const piece = bd[r][c];
    if (!piece) return [];
    const moves = [];
    const color = isWhite(piece) ? 'w' : 'b';
    const type = piece.toLowerCase();

    const addMove = (tr, tc) => {
      if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
        const target = bd[tr][tc];
        if (!target) {
          moves.push({ from: [r, c], to: [tr, tc] });
          return true;
        } else if (!isSameColor(piece, target)) {
          moves.push({ from: [r, c], to: [tr, tc] });
          return false;
        }
      }
      return false;
    };

    if (type === 'p') {
      const dir = color === 'w' ? -1 : 1;
      const startRank = color === 'w' ? 6 : 1;

      // 1 step forward
      if (r + dir >= 0 && r + dir < 8 && !bd[r + dir][c]) {
        moves.push({ from: [r, c], to: [r + dir, c] });
        // 2 steps forward
        if (r === startRank && !bd[r + 2 * dir][c]) {
          moves.push({ from: [r, c], to: [r + 2 * dir, c] });
        }
      }
      // Diagonal captures
      for (let dc of [-1, 1]) {
        const tr = r + dir;
        const tc = c + dc;
        if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
          const target = bd[tr][tc];
          if (target && !isSameColor(piece, target)) {
            moves.push({ from: [r, c], to: [tr, tc] });
          }
        }
      }
    } else if (type === 'n') {
      const knightOffsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      for (let [dr, dc] of knightOffsets) {
        addMove(r + dr, c + dc);
      }
    } else if (type === 'b' || type === 'r' || type === 'q') {
      const dirs = [];
      if (type === 'b' || type === 'q') {
        dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
      }
      if (type === 'r' || type === 'q') {
        dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);
      }
      for (let [dr, dc] of dirs) {
        let tr = r + dr;
        let tc = c + dc;
        while (addMove(tr, tc)) {
          tr += dr;
          tc += dc;
        }
      }
    } else if (type === 'k') {
      const kingDirs = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
      ];
      for (let [dr, dc] of kingDirs) {
        addMove(r + dr, c + dc);
      }
    }

    return moves;
  }

  function findKing(bd, color) {
    const kingPiece = color === 'w' ? 'K' : 'k';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (bd[r][c] === kingPiece) return [r, c];
      }
    }
    return null;
  }

  function isSquareAttacked(bd, sq, attackerColor) {
    if (!sq) return false;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = bd[r][c];
        if (piece && ((attackerColor === 'w' && isWhite(piece)) || (attackerColor === 'b' && isBlack(piece)))) {
          const moves = getRawMoves(bd, r, c);
          if (moves.some(m => m.to[0] === sq[0] && m.to[1] === sq[1])) return true;
        }
      }
    }
    return false;
  }

  function isKingInCheck(bd, color) {
    const kingPos = findKing(bd, color);
    if (!kingPos) return false;
    const opponentColor = color === 'w' ? 'b' : 'w';
    return isSquareAttacked(bd, kingPos, opponentColor);
  }

  function applyMove(bd, move) {
    const newBd = bd.map(row => [...row]);
    const [fr, fc] = move.from;
    const [tr, tc] = move.to;
    let piece = newBd[fr][fc];

    // Pawn Promotion (Auto to Queen)
    if (piece === 'P' && tr === 0) piece = 'Q';
    if (piece === 'p' && tr === 7) piece = 'q';

    newBd[tr][tc] = piece;
    newBd[fr][fc] = '';
    return newBd;
  }

  function getLegalMovesForColor(bd, color) {
    const allMoves = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = bd[r][c];
        if (piece && ((color === 'w' && isWhite(piece)) || (color === 'b' && isBlack(piece)))) {
          const raw = getRawMoves(bd, r, c);
          for (let m of raw) {
            const nextBd = applyMove(bd, m);
            if (!isKingInCheck(nextBd, color)) {
              allMoves.push(m);
            }
          }
        }
      }
    }
    return allMoves;
  }

  function evaluateBoard(bd) {
    let score = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = bd[r][c];
        if (!piece) continue;

        let val = PIECE_VALUES[piece] || 0;
        let pstVal = 0;
        const type = piece.toLowerCase();
        let pst = null;

        if (type === 'p') pst = pawnPST;
        else if (type === 'n') pst = knightPST;
        else if (type === 'b') pst = bishopPST;
        else if (type === 'r') pst = rookPST;
        else if (type === 'q') pst = queenPST;
        else if (type === 'k') pst = kingPST;

        if (pst) {
          pstVal = isWhite(piece) ? pst[r][c] : pst[7 - r][c];
        }

        const total = val + pstVal;
        if (isWhite(piece)) score += total;
        else score -= total;
      }
    }
    return score;
  }

  function minimax(bd, depth, alpha, beta, isMaximizing) {
    if (depth === 0) return evaluateBoard(bd);

    const currentColor = isMaximizing ? 'w' : 'b';
    const moves = getLegalMovesForColor(bd, currentColor);

    if (moves.length === 0) {
      if (isKingInCheck(bd, currentColor)) {
        return isMaximizing ? -99999 + depth : 99999 - depth; // Checkmate
      }
      return 0; // Stalemate
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let m of moves) {
        const nextBd = applyMove(bd, m);
        const evalVal = minimax(nextBd, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, evalVal);
        alpha = Math.max(alpha, evalVal);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let m of moves) {
        const nextBd = applyMove(bd, m);
        const evalVal = minimax(nextBd, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, evalVal);
        beta = Math.min(beta, evalVal);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  function getBestMove(bd, color, difficulty) {
    const moves = getLegalMovesForColor(bd, color);
    if (moves.length === 0) return null;

    if (difficulty === 'easy') {
      const captures = moves.filter(m => bd[m.to[0]][m.to[1]]);
      if (captures.length > 0 && Math.random() > 0.4) {
        return captures[Math.floor(Math.random() * captures.length)];
      }
      return moves[Math.floor(Math.random() * moves.length)];
    }

    const depth = difficulty === 'hard' ? 3 : 2;
    const isMaximizing = color === 'w';
    let bestMove = null;
    let bestEval = isMaximizing ? -Infinity : Infinity;

    moves.sort(() => Math.random() - 0.5);

    for (let m of moves) {
      const nextBd = applyMove(bd, m);
      const evalVal = minimax(nextBd, depth - 1, -Infinity, Infinity, !isMaximizing);
      if (isMaximizing) {
        if (evalVal > bestEval) {
          bestEval = evalVal;
          bestMove = m;
        }
      } else {
        if (evalVal < bestEval) {
          bestEval = evalVal;
          bestMove = m;
        }
      }
    }

    return bestMove || moves[0];
  }

  function handleSquareClick(r, c) {
    if (isGameOver || turn !== playerColor) return;

    const clickedPiece = board[r][c];

    if (clickedPiece && ((playerColor === 'w' && isWhite(clickedPiece)) || (playerColor === 'b' && isBlack(clickedPiece)))) {
      selectedSquare = [r, c];
      const moves = getLegalMovesForColor(board, playerColor);
      legalMoves = moves.filter(m => m.from[0] === r && m.from[1] === c);
      renderBoard();
      return;
    }

    if (selectedSquare) {
      const targetMove = legalMoves.find(m => m.to[0] === r && m.to[1] === c);
      if (targetMove) {
        executeMove(targetMove);
        selectedSquare = null;
        legalMoves = [];
      } else {
        selectedSquare = null;
        legalMoves = [];
        renderBoard();
      }
    }
  }

  function executeMove(move) {
    const [fr, fc] = move.from;
    const [tr, tc] = move.to;
    const captured = board[tr][tc];

    if (captured) {
      if (isWhite(captured)) capturedWhite.push(captured);
      else capturedBlack.push(captured);
    }

    const pieceMoved = board[fr][fc];
    const algFrom = String.fromCharCode(97 + fc) + (8 - fr);
    const algTo = String.fromCharCode(97 + tc) + (8 - tr);
    moveHistory.push(`${pieceMoved.toUpperCase()} ${algFrom} ➔ ${algTo}`);

    board = applyMove(board, move);
    turn = turn === 'w' ? 'b' : 'w';

    renderBoard();
    updateStatus();

    const nextMoves = getLegalMovesForColor(board, turn);
    if (nextMoves.length === 0) {
      isGameOver = true;
      if (isKingInCheck(board, turn)) {
        const winner = turn === playerColor ? 'AI' : 'Player';
        if (winner === 'Player') {
          let rewardDC = aiDifficulty === 'hard' ? 300 : (aiDifficulty === 'medium' ? 150 : 75);
          alert(`🏆 CHECKMATE! You won against the AI! (+${rewardDC} Dragon Coins)`);
          let curDC = parseInt(localStorage.getItem('drag0n_dc') || '0');
          localStorage.setItem('drag0n_dc', (curDC + rewardDC).toString());
          if (window.addXP) window.addXP(300);
          if (window.updateProfileWidget) window.updateProfileWidget();
        } else {
          alert(`☠️ CHECKMATE! AI wins! Try again!`);
        }
      } else {
        alert(`🤝 STALEMATE! Game ends in a draw!`);
      }
      updateStatus();
      return;
    }

    if (!isGameOver && turn === aiColor) {
      setTimeout(makeAIMove, 500);
    }
  }

  function makeAIMove() {
    if (isGameOver || turn !== aiColor) return;
    const bestMove = getBestMove(board, aiColor, aiDifficulty);
    if (bestMove) {
      executeMove(bestMove);
    }
  }

  function renderBoard() {
    const boardEl = document.getElementById('chess-board');
    if (!boardEl) return;
    boardEl.innerHTML = '';

    const inCheck = isKingInCheck(board, turn);
    const kingPos = inCheck ? findKing(board, turn) : null;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = document.createElement('div');
        const isLight = (r + c) % 2 === 0;
        sq.className = `chess-sq ${isLight ? 'sq-light' : 'sq-dark'}`;

        const isSel = selectedSquare && selectedSquare[0] === r && selectedSquare[1] === c;
        const isLegal = legalMoves.some(m => m.to[0] === r && m.to[1] === c);
        const isKingCheckSq = kingPos && kingPos[0] === r && kingPos[1] === c;

        if (isSel) sq.classList.add('sq-selected');
        if (isLegal) sq.classList.add('sq-legal');
        if (isKingCheckSq) sq.classList.add('sq-check');

        const piece = board[r][c];
        if (piece) {
          const pieceEl = document.createElement('span');
          pieceEl.className = `chess-piece ${isWhite(piece) ? 'piece-white' : 'piece-black'}`;
          pieceEl.innerText = PIECE_SYMBOLS[piece] || piece;
          sq.appendChild(pieceEl);
        }

        if (isLegal && !piece) {
          const dot = document.createElement('div');
          dot.className = 'legal-dot';
          sq.appendChild(dot);
        }

        sq.addEventListener('click', () => handleSquareClick(r, c));
        boardEl.appendChild(sq);
      }
    }

    renderCaptured();
    renderHistory();
  }

  function renderCaptured() {
    const capWEl = document.getElementById('chess-cap-white');
    const capBEl = document.getElementById('chess-cap-black');
    if (capWEl) capWEl.innerText = capturedWhite.map(p => PIECE_SYMBOLS[p]).join(' ');
    if (capBEl) capBEl.innerText = capturedBlack.map(p => PIECE_SYMBOLS[p]).join(' ');
  }

  function renderHistory() {
    const histEl = document.getElementById('chess-history');
    if (histEl) {
      histEl.innerHTML = moveHistory.slice(-8).map(m => `<div>${m}</div>`).join('');
      histEl.scrollTop = histEl.scrollHeight;
    }
  }

  function updateStatus() {
    const statusEl = document.getElementById('chess-status');
    if (!statusEl) return;

    if (isGameOver) {
      statusEl.innerText = 'Game Over';
      statusEl.style.color = '#ef4444';
      return;
    }

    const inCheck = isKingInCheck(board, turn);
    const isPlayerTurn = turn === playerColor;

    if (inCheck) {
      statusEl.innerText = isPlayerTurn ? '⚠️ CHECK! Your King is under attack!' : '⚔️ CHECK! AI King is under attack!';
      statusEl.style.color = '#fbbf24';
    } else {
      statusEl.innerText = isPlayerTurn ? 'Your Turn (White)' : '🤖 AI is calculating move...';
      statusEl.style.color = isPlayerTurn ? '#38bdf8' : '#c084fc';
    }
  }

  window.setChessDifficulty = function(diff) {
    aiDifficulty = diff;
  };

  window.restartChessGame = function() {
    initBoard();
  };

  window.initChessUI = function() {
    initBoard();
  };

  window.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('chess-board')) {
      initBoard();
    }
  });
})();
