import re

with open("games.html", "r") as f:
    games_html = f.read()

ttt_html = """
      <div class="glass-card" style="border-color: rgba(99, 102, 241, 0.4);">
        <h3 style="color: #6366f1;">⚔️ Multiplayer Tic-Tac-Toe</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Play online against others!</p>
        
        <div id="ttt-lobby-ui" style="margin-top: 10px;">
          <button onclick="window.createTTTGame()" style="background:#4f46e5; border:none; padding:8px 12px; color:white; border-radius:4px; cursor:pointer;">Create Game</button>
          <div style="margin-top: 10px; font-size: 0.9rem;">
            Or enter Game ID: <input type="text" id="ttt-join-id" style="width: 80px; padding:4px; background:rgba(0,0,0,0.5); color:white; border:1px solid #4f46e5;">
            <button onclick="window.joinTTTGame()" style="background:#4338ca; border:none; padding:5px 10px; color:white; border-radius:4px; cursor:pointer;">Join</button>
          </div>
        </div>
        
        <div id="ttt-game-ui" style="display:none; margin-top: 10px; text-align:center;">
          <h4 id="ttt-status" style="color:#fbbf24; margin-bottom:10px;">Waiting for opponent...</h4>
          <h5 id="ttt-room-id" style="color:var(--text-muted); font-size:0.7rem;"></h5>
          <div style="display:grid; grid-template-columns: repeat(3, 50px); gap:5px; justify-content:center; margin:0 auto;">
            <div class="ttt-cell" onclick="window.playTTTMove(0)" style="width:50px; height:50px; background:rgba(255,255,255,0.1); border:1px solid #4f46e5; display:flex; align-items:center; justify-content:center; font-size:2rem; cursor:pointer;"></div>
            <div class="ttt-cell" onclick="window.playTTTMove(1)" style="width:50px; height:50px; background:rgba(255,255,255,0.1); border:1px solid #4f46e5; display:flex; align-items:center; justify-content:center; font-size:2rem; cursor:pointer;"></div>
            <div class="ttt-cell" onclick="window.playTTTMove(2)" style="width:50px; height:50px; background:rgba(255,255,255,0.1); border:1px solid #4f46e5; display:flex; align-items:center; justify-content:center; font-size:2rem; cursor:pointer;"></div>
            <div class="ttt-cell" onclick="window.playTTTMove(3)" style="width:50px; height:50px; background:rgba(255,255,255,0.1); border:1px solid #4f46e5; display:flex; align-items:center; justify-content:center; font-size:2rem; cursor:pointer;"></div>
            <div class="ttt-cell" onclick="window.playTTTMove(4)" style="width:50px; height:50px; background:rgba(255,255,255,0.1); border:1px solid #4f46e5; display:flex; align-items:center; justify-content:center; font-size:2rem; cursor:pointer;"></div>
            <div class="ttt-cell" onclick="window.playTTTMove(5)" style="width:50px; height:50px; background:rgba(255,255,255,0.1); border:1px solid #4f46e5; display:flex; align-items:center; justify-content:center; font-size:2rem; cursor:pointer;"></div>
            <div class="ttt-cell" onclick="window.playTTTMove(6)" style="width:50px; height:50px; background:rgba(255,255,255,0.1); border:1px solid #4f46e5; display:flex; align-items:center; justify-content:center; font-size:2rem; cursor:pointer;"></div>
            <div class="ttt-cell" onclick="window.playTTTMove(7)" style="width:50px; height:50px; background:rgba(255,255,255,0.1); border:1px solid #4f46e5; display:flex; align-items:center; justify-content:center; font-size:2rem; cursor:pointer;"></div>
            <div class="ttt-cell" onclick="window.playTTTMove(8)" style="width:50px; height:50px; background:rgba(255,255,255,0.1); border:1px solid #4f46e5; display:flex; align-items:center; justify-content:center; font-size:2rem; cursor:pointer;"></div>
          </div>
          <button onclick="window.leaveTTTGame()" style="background:#ef4444; border:none; padding:5px 10px; color:white; border-radius:4px; cursor:pointer; margin-top:15px;">Leave Game</button>
        </div>
      </div>
"""

if "ttt-lobby-ui" not in games_html:
    games_html = games_html.replace('<div class="games-grid">', '<div class="games-grid">\n' + ttt_html)
    with open("games.html", "w") as f:
        f.write(games_html)


with open("assets/js/main.js", "r") as f:
    main_js = f.read()

ttt_logic = """
    // MULTIPLAYER TIC-TAC-TOE
    let currentTTTRoom = null;
    let myTTTSymbol = '';
    
    window.createTTTGame = function() {
      if(!localStorage.getItem('drag0n_user')) return alert("Create a profile first!");
      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      currentTTTRoom = roomId;
      myTTTSymbol = 'X';
      
      const gameRef = firebase.database().ref('ttt_games/' + roomId);
      gameRef.set({
        host: localStorage.getItem('drag0n_user'),
        guest: null,
        board: Array(9).fill(''),
        turn: 'X',
        winner: null,
        timestamp: Date.now()
      });
      
      document.getElementById('ttt-lobby-ui').style.display = 'none';
      document.getElementById('ttt-game-ui').style.display = 'block';
      document.getElementById('ttt-room-id').innerText = 'Game ID: ' + roomId;
      document.getElementById('ttt-status').innerText = 'Waiting for opponent...';
      listenToTTT(roomId);
    };

    window.joinTTTGame = function() {
      if(!localStorage.getItem('drag0n_user')) return alert("Create a profile first!");
      const roomId = document.getElementById('ttt-join-id').value.toUpperCase().trim();
      if(!roomId) return;
      
      const gameRef = firebase.database().ref('ttt_games/' + roomId);
      gameRef.once('value').then(snap => {
        if(snap.exists() && !snap.val().guest) {
          gameRef.update({ guest: localStorage.getItem('drag0n_user') });
          currentTTTRoom = roomId;
          myTTTSymbol = 'O';
          document.getElementById('ttt-lobby-ui').style.display = 'none';
          document.getElementById('ttt-game-ui').style.display = 'block';
          document.getElementById('ttt-room-id').innerText = 'Game ID: ' + roomId;
          listenToTTT(roomId);
        } else {
          alert("Room not found or already full.");
        }
      });
    };

    function listenToTTT(roomId) {
      const gameRef = firebase.database().ref('ttt_games/' + roomId);
      gameRef.on('value', snap => {
        const game = snap.val();
        if(!game) return window.leaveTTTGame(); // Game deleted
        
        const cells = document.querySelectorAll('.ttt-cell');
        for(let i=0; i<9; i++) {
          cells[i].innerText = game.board[i];
          cells[i].style.color = game.board[i] === 'X' ? '#ef4444' : '#3b82f6';
        }
        
        if(game.winner) {
          if(game.winner === 'Draw') {
            document.getElementById('ttt-status').innerText = "It's a draw!";
          } else {
            document.getElementById('ttt-status').innerText = (game.winner === myTTTSymbol ? "You won!" : "Opponent won!");
            if(game.winner === myTTTSymbol && window.addXP) window.addXP(100);
          }
        } else if(!game.guest) {
          document.getElementById('ttt-status').innerText = 'Waiting for opponent...';
        } else {
          document.getElementById('ttt-status').innerText = (game.turn === myTTTSymbol ? "YOUR TURN" : "Opponent's turn");
        }
      });
    }

    window.playTTTMove = function(index) {
      if(!currentTTTRoom) return;
      const gameRef = firebase.database().ref('ttt_games/' + currentTTTRoom);
      gameRef.transaction(game => {
        if(game && game.guest && !game.winner && game.turn === myTTTSymbol && game.board[index] === '') {
          game.board[index] = myTTTSymbol;
          
          // Check win
          const winPatterns = [
            [0,1,2],[3,4,5],[6,7,8], // rows
            [0,3,6],[1,4,7],[2,5,8], // cols
            [0,4,8],[2,4,6] // diag
          ];
          let won = false;
          for(let p of winPatterns) {
            if(game.board[p[0]] && game.board[p[0]] === game.board[p[1]] && game.board[p[1]] === game.board[p[2]]) won = true;
          }
          
          if(won) {
            game.winner = myTTTSymbol;
          } else if(!game.board.includes('')) {
            game.winner = 'Draw';
          } else {
            game.turn = myTTTSymbol === 'X' ? 'O' : 'X';
          }
        }
        return game;
      });
    };
    
    window.leaveTTTGame = function() {
      if(currentTTTRoom) firebase.database().ref('ttt_games/' + currentTTTRoom).off();
      currentTTTRoom = null;
      document.getElementById('ttt-lobby-ui').style.display = 'block';
      document.getElementById('ttt-game-ui').style.display = 'none';
      
      const cells = document.querySelectorAll('.ttt-cell');
      cells.forEach(c => c.innerText = '');
    };
"""
if "// MULTIPLAYER TIC-TAC-TOE" not in main_js:
    main_js += "\n" + ttt_logic
    with open("assets/js/main.js", "w") as f:
        f.write(main_js)

EOF
