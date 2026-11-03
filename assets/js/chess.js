/* ==========================================================================
   DRAG0N CHESS VS VIRTUAL PET & AI ENGINE (2026)
   Enhanced 8x8 Chess Engine with Minimax AI, Piece-Square Tables,
   Live Virtual Pet Opponent integration, dynamic speech/reactions,
   sound synthesis, and Dragon Coin / XP / Friendship rewards.
   ========================================================================== */

(function(global) {
  'use strict';

  // Piece values for Minimax evaluation
  const PIECE_VALUES = {
    'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000,
    'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900, 'K': 20000
  };

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
  let turn = 'w'; // 'w' (White/Player) or 'b' (Black/Pet Opponent)
  let playerColor = 'w';
  let aiColor = 'b';
  let selectedSquare = null;
  let legalMoves = [];
  let moveHistory = [];
  let capturedWhite = [];
  let capturedBlack = [];
  let isGameOver = false;
  let aiDifficulty = 'medium'; // 'easy', 'medium', 'hard'
  let activePetOpponent = 'dragon';

  // Pet Dialogue Scripts
  const PET_DIALOG_LINES = {
    dragon: {
      sound: 'roar',
      name: 'Ignis (Baby Dragon)',
      icon: '🐉',
      start: ["Rawr! You dare challenge Ignis to chess?! Prepare for fiery tactics!", "A dragon's mind is as sharp as its claws! Make your move, mortal!"],
      playerMove: ["A pawn push? Typical mortal defense. My flames see right through it!", "*swishes tail* Moving that piece won't save you from dragon breath!"],
      petMove: ["Behold, a fiery advance! *flares nostrils*", "My pieces march forward like an army of flames!", "Sparks fly as my strategy unfolds!"],
      playerCapture: ["How DARE you take my piece! Flames of vengeance will consume your board!", "*growls fiercely* That piece will be avenged tenfold!"],
      petCapture: ["CRUNCH! Delicious piece! One step closer to your king's hoard!", "Roasted and captured! Another victory for the dragon!"],
      checkOnPlayer: ["CHECK! *ROAAAR!* Your king is scorched by dragon fire! Tremble!", "Check! Can you smell the smoke around your king's throne?!"],
      checkOnPet: ["*Hisses and breathes smoke* You dare threaten my royal scales?! Insolence!", "Alert the guard dragons! My king requires defense!"],
      petWin: ["CHECKMATE! The dragon reigns supreme! Kneel and bring me gold and treats!", "Hahaha! Total annihilation! Your kingdom belongs to Ignis!"],
      playerWin: ["Incredible... you managed to outmaneuver a dragon! Take this bounty of Dragon Coins, champion!", "A worthy adversary! My respect—and your DC reward—is yours!"],
      draw: ["Stalemate! An eternal truce between dragon and mortal."]
    },
    cat: {
      sound: 'purr',
      name: 'Neko (Calico Cat)',
      icon: '🐱',
      start: ["Meow~ Hello human! Let's see if your hands are as nimble as my paws!", "Purrrrr... Chess is just like stalking a laser pointer, you know!"],
      playerMove: ["Hmm, curious move. Did you think I wouldn't notice that diagonal?", "*licks paw* Bold move... let's see how you handle this!"],
      petMove: ["*swishes tail* Paw to the center! Graceful and lethal.", "Meow, you didn't expect that maneuver, did you?"],
      playerCapture: ["HISS! Put that piece down! *swipes paw grumpily*", "Meow! Hey, I was saving that knight for my nap!"],
      petCapture: ["Yum, caught you like a fat fish! Purrrrr~", "*pounces* Captured! My claws never miss!"],
      checkOnPlayer: ["CHECK! Purrrr~ Your king is cornered like a mouse in a box!", "Check! Meow-ha-ha, nowhere left to run!"],
      checkOnPet: ["Mrow?! Back off my king or feel my claws! *fluffs tail*", "Hiss! Not my king! Time for a tactical leap!"],
      petWin: ["CHECKMATE! Best feline tactician in the realm! Now, hand over the fish treats!", "Purrrrfect game! Neko wins again!"],
      playerWin: ["Aww, you got me! Good game, human! Here are your shiny Dragon Coins!", "Meow! You played well. I'll tolerate this defeat... for now!"],
      draw: ["Meow... a draw. Let's both curl up for a nap instead."]
    },
    cyber_puppy: {
      sound: 'cyber',
      name: 'Sparky (Cyber Puppy)',
      icon: '🐶',
      start: ["SYSTEM BOOT: Tactical Chess Protocol initialized! Visor: ONLINE. Woof!", "Ping 12ms. Algorithmic analysis ready. Let's compute a win!"],
      playerMove: ["Processing opponent move... Visor scanning board coordinates.", "Move logged into tactical cache. Woof!"],
      petMove: ["Processing minimax depth... Move executed! Woof-bot engaged.", "Calculated probability of move success: 99.4%!"],
      playerCapture: ["Warning! Unit casualty registered in sector! Re-routing tactical circuits!", "Beep boof! Visor alarms ringing! That was my favorite piece!"],
      petCapture: ["Target eliminated! Subroutine 'Piece Chomp' executed successfully!", "Beep! One opponent asset neutralized. Good boy status: Verified!"],
      checkOnPlayer: ["ALERT: Hostile king pinned! Visor laser locked! CHECK!", "Tactical siren: Check state active! King defenses failing!"],
      checkOnPet: ["CRITICAL: Threat detected near VIP King CPU! Deploying firewalls!", "Beep-beep-beep! Defensive protocol Alpha active! No checkmate allowed!"],
      petWin: ["CHECKMATE! Algorithmic victory confirmed! Deploy victory tail wag protocol!", "SYSTEM: Mission Accomplished! Winner = Sparky! Woof woof!"],
      playerWin: ["System override! You found a winning line! Rewarding Dragon Coins to victor!", "Error 200: Human superior tactics verified! Enjoy your DC reward!"],
      draw: ["Computational deadlock detected! Both systems tie."]
    },
    red_panda: {
      sound: 'bubble',
      name: 'Rusty (Red Panda)',
      icon: '🦊',
      start: ["Enthusiastic chitter! Ready for some bamboo tactics?! *tail swish*", "Let's play! My fluffy tail is ready for high-speed chess!"],
      playerMove: ["Ooh, tricky move! *twitches ears excitedly*", "I see what you're doing over there!"],
      petMove: ["*bounces* Look at this move! Acrobatics on the 64 squares!", "Bamboo power! Pushing pawns like trees in the forest!"],
      playerCapture: ["Eep! You stole my piece?! *puffs out tail*", "No fair! I was playing with that bishop!"],
      petCapture: ["Caught it! Stashed right in my fluffy paws!", "Chomp! Like a crunchy stalk of fresh bamboo!"],
      checkOnPlayer: ["CHECK! Look out! Red panda high jump attack!", "Check! My fluffy strategy is closing in on your king!"],
      checkOnPet: ["Waaah! Protect the king! *scampers up a branch*", "Chitter! Hands off the royal panda!"],
      petWin: ["CHECKMATE! The Red Panda wins the grand tournament! Yay!", "Fluffy victory dance! Best day ever!"],
      playerWin: ["Great match! You're really clever! Here's your Dragon Coins reward!", "Aww, you won! You get all the gold coins!"],
      draw: ["We tied! Let's share some snacks!"]
    },
    cosmic_axolotl: {
      sound: 'bubble',
      name: 'Aura (Cosmic Axolotl)',
      icon: '🦎',
      start: ["*starlight hum* The celestial tides align for a game of kings.", "From the astral void, I greet you! Let our minds dance among the stars."],
      playerMove: ["A path ripples through the cosmic aether.", "*glowing frills pulse* A curious branch in spacetime."],
      petMove: ["*frills shimmer with violet light* A move written in the constellations.", "The starlight currents flow across the board."],
      playerCapture: ["*soft gasp* A star has faded from my constellation...", "A piece returned to the cosmic dust. Fascinating move."],
      petCapture: ["Absorbed into nebula starlight! The galaxy balances.", "A celestial capture! The cosmos welcomes your piece."],
      checkOnPlayer: ["CHECK! The gravitational pull of the black hole tightens around your king!", "Check! Cosmic light illuminates your king's vulnerability."],
      checkOnPet: ["*gills flare with defensive glow* The astral realm protects its sovereign!", "A direct strike! Shifting quantum coordinates!"],
      petWin: ["CHECKMATE! The stars have decreed this outcome! Galactic peace is restored.", "Celestial victory! The cosmic axolotl triumphs!"],
      playerWin: ["Brilliant illumination! Your mortal mind has surpassed the stars! Claim your DC reward!", "The cosmos honors your victory! Dragon Coins and stellar glory to you!"],
      draw: ["A harmonious celestial alignment. The game rests in cosmic equilibrium."]
    }
  };

  function getPetOpponentData(id) {
    if (id && id.startsWith('mutant_')) {
      const mutants = (window.PetMutationLab && window.PetMutationLab.getMutatedPets) 
        ? window.PetMutationLab.getMutatedPets() 
        : JSON.parse(localStorage.getItem('drag0n_mutated_pets') || '[]');
      const m = mutants.find(p => p.id === id);
      if (m) {
        return {
          id: m.id,
          name: m.name,
          icon: '🧬',
          isMutant: true,
          mutantObj: m,
          sound: m.traits && m.traits.personalitySound ? m.traits.personalitySound : 'mutate',
          start: [`${m.name}: [BIO-SYNTHESIS READY] I have awakened to conquer the chessboard!`],
          playerMove: [`${m.name}: Hybrid receptors calculating your move... intriguing!`, `${m.name}: Your pawn step triggers my mutated instincts!`],
          petMove: [`${m.name}: Dominant traits unleashed! Check my hybrid maneuver!`, `${m.name}: *neon glow intensifies* A move forged in the mutation lab!`],
          playerCapture: [`${m.name}: *toxic hiss* You took my piece! Genetic vengeance awaits!`, `${m.name}: A tactical loss! Regrowing defenses!`],
          petCapture: [`${m.name}: *bio-absorption* Your piece has been consumed into my hybrid biomass!`, `${m.name}: Target acquired and dismantled!`],
          checkOnPlayer: [`${m.name}: ⚠️ CHECK! The mutant chimera closes in on your king!`, `${m.name}: Bio-luminescent lock on your king!`],
          checkOnPet: [`${m.name}: ☣️ Warning: Mutated core under threat! Repelling attacker!`, `${m.name}: My king resists your assault!`],
          petWin: [`${m.name}: 🏆 CHECKMATE! The ultimate hybrid pet stands victorious! Bow to the chimera!`],
          playerWin: [`${m.name}: Extraordinary! You bested the ultimate mutant! Take your Dragon Coins!`],
          draw: [`${m.name}: Synthesis stalemate! Evenly matched!`]
        };
      }
    }

    if (PET_DIALOG_LINES[id]) {
      return PET_DIALOG_LINES[id];
    }
    // Fallback to dragon or cat
    return PET_DIALOG_LINES.dragon;
  }

  function triggerPetReaction(event, data = {}) {
    const pet = getPetOpponentData(activePetOpponent);
    const bubbleEl = document.getElementById('chess-pet-bubble');
    const emoteEl = document.getElementById('chess-pet-reaction-icon');

    let lines = pet[event] || pet.start;
    let text = lines[Math.floor(Math.random() * lines.length)];

    if (bubbleEl) {
      bubbleEl.textContent = text;
      bubbleEl.classList.remove('bubble-pop');
      void bubbleEl.offsetWidth; // Force reflow
      bubbleEl.classList.add('bubble-pop');
    }

    if (emoteEl) {
      const emoteMap = {
        start: '👋',
        playerMove: '🤔',
        petMove: '😼',
        playerCapture: '😱',
        petCapture: '😋',
        checkOnPlayer: '⚔️',
        checkOnPet: '😤',
        petWin: '🏆',
        playerWin: '🎉',
        draw: '🤝'
      };
      emoteEl.textContent = emoteMap[event] || '🐾';
    }

    // Play native synth sound
    if (window.PetMutationLab && window.PetMutationLab.playSynthSound) {
      let snd = pet.sound || 'purr';
      if (event === 'checkOnPlayer' || event === 'checkOnPet') snd = 'zap';
      if (event === 'playerWin') snd = 'victory';
      window.PetMutationLab.playSynthSound(snd);
    }
  }

  function updatePetOpponentUI() {
    const avatarEl = document.getElementById('chess-pet-avatar');
    const nameEl = document.getElementById('chess-pet-name');
    const pet = getPetOpponentData(activePetOpponent);

    if (nameEl) {
      nameEl.textContent = pet.name || 'Virtual Pet';
    }

    if (avatarEl) {
      if (pet.isMutant && window.PetMutationLab && window.PetMutationLab.renderHybridPetSVG) {
        avatarEl.innerHTML = window.PetMutationLab.renderHybridPetSVG(pet.mutantObj, 56);
      } else if (window.DragonSprites && window.DragonSprites.renderSVG) {
        const spriteKey = 'PET_' + (activePetOpponent || 'DRAGON').toUpperCase();
        avatarEl.innerHTML = window.DragonSprites.renderSVG(spriteKey, 56) || `<span style="font-size: 2.5rem;">${pet.icon || '🐉'}</span>`;
      } else {
        avatarEl.innerHTML = `<span style="font-size: 2.5rem;">${pet.icon || '🐉'}</span>`;
      }
    }

    // Sync pet selector if present
    const sel = document.getElementById('chess-pet-selector');
    if (sel) {
      populatePetSelectorOptions(sel);
      sel.value = activePetOpponent;
    }
  }

  function populatePetSelectorOptions(selectEl) {
    if (!selectEl) return;
    const currentVal = activePetOpponent;
    selectEl.innerHTML = '';

    const baseGroup = document.createElement('optgroup');
    baseGroup.label = 'Mascot Companions';
    const mascots = [
      { id: 'dragon', name: 'Ignis (Baby Dragon)' },
      { id: 'cat', name: 'Neko (Calico Cat)' },
      { id: 'cyber_puppy', name: 'Sparky (Cyber Puppy)' },
      { id: 'red_panda', name: 'Rusty (Red Panda)' },
      { id: 'cosmic_axolotl', name: 'Aura (Cosmic Axolotl)' }
    ];
    mascots.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.name;
      baseGroup.appendChild(opt);
    });
    selectEl.appendChild(baseGroup);

    // Mutated pets
    const mutants = (window.PetMutationLab && window.PetMutationLab.getMutatedPets) 
      ? window.PetMutationLab.getMutatedPets() 
      : JSON.parse(localStorage.getItem('drag0n_mutated_pets') || '[]');
    
    if (mutants.length > 0) {
      const mutantGroup = document.createElement('optgroup');
      mutantGroup.label = '🧬 Mutated Hybrids';
      mutants.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = `🧬 ${m.name} (Hybrid)`;
        mutantGroup.appendChild(opt);
      });
      selectEl.appendChild(mutantGroup);
    }

    selectEl.value = currentVal;
  }

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

    // Default to active companion if available
    const activeComp = localStorage.getItem('activeCompanion');
    if (activeComp) {
      activePetOpponent = activeComp;
    }

    updatePetOpponentUI();
    renderBoard();
    updateStatus();
    triggerPetReaction('start');

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
        return isMaximizing ? -99999 + depth : 99999 - depth;
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
    const isPlayer = (turn === playerColor);

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

    // Check game termination
    const nextMoves = getLegalMovesForColor(board, turn);
    const inCheck = isKingInCheck(board, turn);

    if (nextMoves.length === 0) {
      isGameOver = true;
      if (inCheck) {
        const winner = turn === playerColor ? 'AI' : 'Player';
        if (winner === 'Player') {
          let rewardDC = aiDifficulty === 'hard' ? 300 : (aiDifficulty === 'medium' ? 150 : 75);
          triggerPetReaction('playerWin');

          // Persist DC rewards
          let curDC = parseInt(localStorage.getItem('drag0n_dc') || '0');
          localStorage.setItem('drag0n_dc', (curDC + rewardDC).toString());
          if (window.addXP) window.addXP(300);
          if (window.updateProfileWidget) window.updateProfileWidget();

          // Add companion friendship bonus
          try {
            const petKey = activePetOpponent;
            const stats = JSON.parse(localStorage.getItem(`companionStats_${petKey}`) || '{"level":1,"xp":0,"energy":100,"happiness":100,"friendship":0}');
            stats.friendship = Math.min(100, stats.friendship + 20);
            stats.happiness = Math.min(100, stats.happiness + 15);
            localStorage.setItem(`companionStats_${petKey}`, JSON.stringify(stats));
          } catch (e) {}

          setTimeout(() => {
            alert(`🏆 CHECKMATE! You defeated your pet in Chess!\n+${rewardDC} Dragon Coins (DC)\n+300 Level EXP\n+20 Pet Friendship!`);
          }, 400);
        } else {
          triggerPetReaction('petWin');
          setTimeout(() => {
            alert(`☠️ CHECKMATE! Your pet won the match! Rematch?`);
          }, 400);
        }
      } else {
        triggerPetReaction('draw');
        setTimeout(() => {
          alert(`🤝 STALEMATE! Game ends in a draw!`);
        }, 400);
      }
      updateStatus();
      return;
    }

    // Reaction to move or check or capture
    if (inCheck) {
      triggerPetReaction(isPlayer ? 'checkOnPet' : 'checkOnPlayer');
    } else if (captured) {
      triggerPetReaction(isPlayer ? 'playerCapture' : 'petCapture');
    } else {
      triggerPetReaction(isPlayer ? 'playerMove' : 'petMove');
    }

    if (!isGameOver && turn === aiColor) {
      setTimeout(makeAIMove, 550);
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
          const spriteKey = (isWhite(piece) ? 'w' : 'b') + piece.toUpperCase();
          if (window.DragonSprites && window.DragonSprites.SPRITES && window.DragonSprites.SPRITES.CHESS_PIECES && window.DragonSprites.SPRITES.CHESS_PIECES[spriteKey]) {
            pieceEl.innerHTML = window.DragonSprites.SPRITES.CHESS_PIECES[spriteKey];
          } else {
            pieceEl.innerText = PIECE_SYMBOLS[piece] || piece;
          }
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
    if (capWEl) {
      if (window.DragonSprites && window.DragonSprites.SPRITES && window.DragonSprites.SPRITES.CHESS_PIECES) {
        capWEl.innerHTML = capturedWhite.map(p => {
          const key = (isWhite(p) ? 'w' : 'b') + p.toUpperCase();
          return window.DragonSprites.SPRITES.CHESS_PIECES[key] || PIECE_SYMBOLS[p];
        }).join('');
      } else {
        capWEl.innerText = capturedWhite.map(p => PIECE_SYMBOLS[p]).join(' ');
      }
    }
    if (capBEl) {
      if (window.DragonSprites && window.DragonSprites.SPRITES && window.DragonSprites.SPRITES.CHESS_PIECES) {
        capBEl.innerHTML = capturedBlack.map(p => {
          const key = (isWhite(p) ? 'w' : 'b') + p.toUpperCase();
          return window.DragonSprites.SPRITES.CHESS_PIECES[key] || PIECE_SYMBOLS[p];
        }).join('');
      } else {
        capBEl.innerText = capturedBlack.map(p => PIECE_SYMBOLS[p]).join(' ');
      }
    }
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
      statusEl.innerText = isPlayerTurn ? '⚠️ CHECK! Your King is in danger!' : '⚔️ CHECK! Pet King under attack!';
      statusEl.style.color = '#fbbf24';
    } else {
      statusEl.innerText = isPlayerTurn ? 'Your Turn (White)' : '🐾 Pet is calculating move...';
      statusEl.style.color = isPlayerTurn ? '#38bdf8' : '#c084fc';
    }
  }

  // Global Exports
  global.setChessDifficulty = function(diff) {
    aiDifficulty = diff;
  };

  global.setChessPetOpponent = function(petId) {
    activePetOpponent = petId;
    updatePetOpponentUI();
    triggerPetReaction('start');
  };

  global.restartChessGame = function() {
    initBoard();
  };

  global.initChessUI = function() {
    initBoard();
  };

  // Listen to mutation event so the pet opponent selector automatically updates if a pet is mutated!
  window.addEventListener('drag0n_pet_mutated', (e) => {
    const sel = document.getElementById('chess-pet-selector');
    if (sel) {
      populatePetSelectorOptions(sel);
    }
  });

  window.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('chess-board')) {
      initBoard();
    }
  });

})(window);
