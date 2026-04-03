    // ------------------------------------
    // 1. CLOCK
    // ------------------------------------
    function updateClock() {
      const now = new Date();
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayName = days[now.getDay()];
      const date = now.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
      const time = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      document.getElementById('clock').textContent = `${dayName}, ${date} – ${time}`;
    }
    updateClock();
    setInterval(updateClock, 1000);

    // ------------------------------------
    // 2. NUMBER GUESSER
    // ------------------------------------
    let secretNumber = Math.floor(Math.random() * 100) + 1;
    let guesses = 0;
    function checkGuess() {
      const guess = Number(document.getElementById('userGuess').value);
      const feedback = document.getElementById('guessFeedback');
      const attempts = document.getElementById('guessAttempts');
      guesses++;

      if (!guess || guess < 1 || guess > 100) {
        feedback.textContent = 'Enter a number between 1 and 100.';
      } else if (guess === secretNumber) {
        feedback.textContent = `Correct! It was ${secretNumber}.`;
        feedback.style.color = '#4ade80';
        attempts.textContent = `You guessed it in ${guesses} tries.`;
      } else if (guess < secretNumber) {
        feedback.textContent = 'Too low. Try again.';
        feedback.style.color = '#fbbf24';
      } else {
        feedback.textContent = 'Too high. Try again.';
        feedback.style.color = '#fbbf24';
      }
    }
    function resetGuessGame() {
      secretNumber = Math.floor(Math.random() * 100) + 1;
      guesses = 0;
      document.getElementById('userGuess').value = '';
      document.getElementById('guessFeedback').textContent = '';
      document.getElementById('guessFeedback').style.color = 'var(--accent)';
      document.getElementById('guessAttempts').textContent = '';
    }

    // ------------------------------------
    // 3. ROCK PAPER SCISSORS
    // ------------------------------------
    function playRPS(playerChoice) {
      const choices = ['rock', 'paper', 'scissors'];
      const computerChoice = choices[Math.floor(Math.random() * 3)];
      let result = '';

      if (playerChoice === computerChoice) {
        result = "It's a draw!";
      } else if (
        (playerChoice === 'rock' && computerChoice === 'scissors') ||
        (playerChoice === 'paper' && computerChoice === 'rock') ||
        (playerChoice === 'scissors' && computerChoice === 'paper')
      ) {
        result = "You win!";
      } else {
        result = "You lose!";
      }

      const map = { rock: 'Rock', paper: 'Paper', scissors: 'Scissors' };
      document.getElementById('rpsResult').innerHTML =
        `You: ${map[playerChoice]} vs PC: ${map[computerChoice]}<br><span style="color:var(--accent); font-size:1.2rem; margin-top:10px; display:inline-block;">${result}</span>`;
    }

    // ------------------------------------
    // 4. MEMORY GAME
    // ------------------------------------
    const cardsArray = ['🍎', '🍎', '🍌', '🍌', '🍇', '🍇', '🍓', '🍓', '🥝', '🥝', '🍍', '🍍', '🍉', '🍉', '🍒', '🍒'];
    let memCardsChosen = [], memCardsChosenIds = [], memCardsMatched = 0, memMoves = 0;

    function shuffle(array) {
      let ci = array.length, ri;
      while (ci !== 0) {
        ri = Math.floor(Math.random() * ci); ci--;
        [array[ci], array[ri]] = [array[ri], array[ci]];
      }
      return array;
    }

    function createMemoryBoard() {
      const g = document.getElementById('memory-game');
      g.innerHTML = '';
      shuffle(cardsArray);
      memCardsMatched = 0; memMoves = 0;
      document.getElementById('memory-moves').textContent = 0;
      document.getElementById('memory-matches').textContent = 0;
      memCardsChosen = []; memCardsChosenIds = [];

      for (let i = 0; i < cardsArray.length; i++) {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.id = i;
        card.innerHTML = `<div class="front">${cardsArray[i]}</div><div class="back"></div>`;
        card.onclick = flipMemoryCard;
        g.appendChild(card);
      }
    }

    function flipMemoryCard() {
      const cid = this.dataset.id;
      if (memCardsChosenIds.includes(cid) || this.classList.contains('flip') || memCardsChosen.length === 2) return;

      this.classList.add('flip');
      memCardsChosen.push(cardsArray[cid]);
      memCardsChosenIds.push(cid);

      if (memCardsChosen.length === 2) {
        memMoves++;
        document.getElementById('memory-moves').textContent = memMoves;
        setTimeout(checkMemoryMatch, 800);
      }
    }

    function checkMemoryMatch() {
      const cards = document.querySelectorAll('.memory-card');
      const [idOne, idTwo] = memCardsChosenIds;

      if (memCardsChosen[0] === memCardsChosen[1] && idOne !== idTwo) {
        cards[idOne].classList.add('match'); cards[idTwo].classList.add('match');
        memCardsMatched++;
        document.getElementById('memory-matches').textContent = memCardsMatched;
      } else {
        cards[idOne].classList.remove('flip'); cards[idTwo].classList.remove('flip');
      }
      memCardsChosen = []; memCardsChosenIds = [];
    }

    function revealMemoryCards() {
      const code = document.getElementById('memoryCodeInput').value.trim().toLowerCase();
      if (code === 'fruits') {
        document.querySelectorAll('.memory-card').forEach(c => c.classList.add('flip'));
      } else {
        alert('Incorrect memory code word!');
      }
    }
    createMemoryBoard();

    // ------------------------------------
    // 5. COLOR SVG
    // ------------------------------------
    const rSlider = document.getElementById("rSlider");
    const gSlider = document.getElementById("gSlider");
    const bSlider = document.getElementById("bSlider");
    const colorPreview = document.getElementById("colorPreview");
    const undoStack = [];

    function getCurrentColor() { return `rgb(${rSlider.value},${gSlider.value},${bSlider.value})`; }
    function updatePreview() { colorPreview.style.backgroundColor = getCurrentColor(); }

    rSlider.oninput = gSlider.oninput = bSlider.oninput = updatePreview;
    updatePreview();

    document.querySelectorAll(".colorable").forEach(el => {
      el.addEventListener("click", e => {
        e.stopPropagation();
        undoStack.push({ element: el, oldColor: el.getAttribute("fill") });
        el.setAttribute("fill", getCurrentColor());
      });
    });

    document.getElementById("undoBtn").onclick = () => {
      if (undoStack.length === 0) return;
      const last = undoStack.pop();
      last.element.setAttribute("fill", last.oldColor || '#fff');
    };

    // ------------------------------------
    // 6. EMOJI HUNTS
    // ------------------------------------
    function setupEmojiHunt(boxId, scoreId, emojisList, targetCount, secretCode) {
      const container = document.getElementById(boxId);
      const scoreDisp = document.getElementById(scoreId);
      const popSound = document.getElementById('pop-sound');
      let score = 0;
      let revealed = false;
      const elements = [];

      for (let i = 0; i < targetCount; i++) {
        const el = document.createElement('span');
        el.textContent = emojisList[Math.floor(Math.random() * emojisList.length)];
        el.className = 'emoji-hidden';

        const size = Math.random() * 10 + 20;
        el.style.fontSize = `${size}px`;
        el.style.top = `${Math.random() * 80}%`;
        el.style.left = `${Math.random() * 80}%`;

        el.addEventListener('click', () => {
          if (!el.classList.contains('emoji-visible')) {
            el.classList.add('emoji-visible');
            score++;
            scoreDisp.textContent = `${scoreId.includes('1') ? 'Left' : 'Right'} Hunt: ${score}/${targetCount}`;
            popSound.currentTime = 0;
            popSound.play().catch(() => { });
            if (score === targetCount) alert('You found them all in ' + boxId + '!');
          }
        });
        container.appendChild(el);
        elements.push(el);
      }

      // Secret Code Logic
      let inputSeq = '';
      document.addEventListener('keydown', (e) => {
        inputSeq += e.key.toLowerCase();
        inputSeq = inputSeq.slice(-secretCode.length);
        if (inputSeq === secretCode && !revealed) {
          revealed = true;
          elements.forEach(el => {
            if (!el.classList.contains('emoji-visible')) { el.classList.add('emoji-visible'); }
          });
        }
      });
    }

    setupEmojiHunt('emoji-hunt-1', 'score-display-1', ['🧋', '🥤', '🧃', '🍹', '🍵'], 30, 'chili');
    setupEmojiHunt('emoji-hunt-2', 'score-display-2', ['💰', '💵', '🪙', '💸', '🤑'], 30, 'yay');

    // ------------------------------------
    // 7. ANIMAL CHAT ROOM (Firebase)
    // ------------------------------------
    // FIREBASE CONFIG
    firebase.initializeApp({
      apiKey: "AIzaSyCDSYPrpnXW1ci2qLrDXvQsmsH9OmUVVFs",
      authDomain: "drag0n-chat.firebaseapp.com",
      databaseURL: "https://drag0n-chat-default-rtdb.firebaseio.com",
      projectId: "drag0n-chat",
      storageBucket: "drag0n-chat.firebasestorage.app",
      messagingSenderId: "44918974111",
      appId: "1:44918974111:web:f017bed12e06b4ae3824aa",
      measurementId: "G-42G7DLKZ4M"
    });

    const db = firebase.database();

    // ROOMS DEFINITION
    const ROOMS = {
      Forest: { name: "Forest", passwordHash: "748f86888e0bad9657dced990a90d705464a7b0ba00f6f20a57d559aad60f165" },
      Cave: { name: "Cave", passwordHash: "b1fe820b8e2228cb303c8cffab708d2c01c501a6ed43e50f88206d9938546ddd" },
      Ocean: { name: "Ocean", passwordHash: "96fe8fe08fd90a993e7b0944798bfb08a84b609f7a721502c9278ea7dd5e83d8" },
      Sky: { name: "Sky", passwordHash: "5772d43f845101daf18520f8d7c36c8443a742641916d8caaff9e5f12b8cf1dc" },
      Volcano: { name: "Volcano", passwordHash: "84c1b84cffe16bac07d970bfbcc774b3d5cd0e486522e3a8eea9c285938b4196" }
    };

    // DAILY PASSWORDS
    function getDailyPassword() {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const today = dayNames[new Date().getDay()];
      const passwords = {
        "Monday": "pistachio",
        "Tuesday": "mango",
        "Wednesday": "strawberry",
        "Thursday": "mint",
        "Friday": "guava",
        "Saturday": "vanilla",
        "Sunday": "chocolate"
      };
      return passwords[today];
    }

    // STATE
    const userId = "u_" + Math.random().toString(36).slice(2);
    let currentRoom = null;
    let currentProfile = null;
    let messagesRef = null;
    let typingRef = null;
    let typingTimeout = null;

    // ELEMENTS
    const chatRoomSel = document.getElementById('chat-room-select');
    const chatProfSel = document.getElementById('chat-profile-select');
    const chatInp = document.getElementById('chat-input-field');
    const chatBtn = document.getElementById('chat-send-btn');
    const chatMsgs = document.getElementById('chat-messages');

    // SITE-WIDE LOCK LOGIC
    const siteModal = document.getElementById('site-password-modal');
    const sitePwInput = document.getElementById('site-pw-input');
    const sitePwError = document.getElementById('site-modal-error');
    const siteUnlockBtn = document.getElementById('site-unlock-btn');

    function tryUnlock() {
      const pw = sitePwInput.value.toLowerCase().trim();
      if (pw === getDailyPassword()) {
        siteModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Re-enable scrolling
      } else {
        sitePwError.style.display = 'block';
        sitePwInput.value = '';
        sitePwInput.focus();
      }
    }

    siteUnlockBtn.addEventListener('click', tryUnlock);
    sitePwInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') tryUnlock();
    });

    // Automatically focus the password input on load
    window.addEventListener('load', () => {
      sitePwInput.focus();
    });

    // ROOM SELECTION
    let pendingRoomKey = null;
    const pwModal = document.getElementById('password-modal');
    const pwInput = document.getElementById('modal-pw-input');
    const pwError = document.getElementById('modal-error');

    chatRoomSel.addEventListener("change", () => {
      const roomKey = chatRoomSel.value;
      if (!roomKey) return;

      pendingRoomKey = roomKey;
      document.getElementById('modal-title').textContent = `Join ${ROOMS[roomKey].name}`;
      pwInput.value = '';
      pwError.style.display = 'none';
      pwModal.style.display = 'flex';
      pwInput.focus();
    });

    document.getElementById('modal-join-btn').addEventListener('click', async () => {
      if (!pendingRoomKey) return;
      const pw = pwInput.value.trim();
      
      const msgUint8 = new TextEncoder().encode(pw);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const pwHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      if (pwHash !== ROOMS[pendingRoomKey].passwordHash) {
        pwError.style.display = 'block';
        return;
      }

      pwModal.style.display = 'none';
      enterRoom(pendingRoomKey);
      pendingRoomKey = null;
    });

    document.getElementById('modal-cancel-btn').addEventListener('click', () => {
      pwModal.style.display = 'none';
      chatRoomSel.value = currentRoom || "";
      pendingRoomKey = null;
    });

    // Allow enter key in modal
    pwInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('modal-join-btn').click();
      }
    });

    function enterRoom(roomKey) {
      currentRoom = roomKey;
      chatMsgs.innerHTML = `<div style="text-align:center;color:#4ade80;margin-top:10px;">Joined ${ROOMS[roomKey].name}! Select a profile to type.</div>`;

      // Attempt to load from Firebase if configured
      try {
        messagesRef = db.ref(`rooms/${roomKey}/messages`);
        typingRef = db.ref(`rooms/${roomKey}/typing`);

        chatProfSel.disabled = false;

        messagesRef.limitToLast(100).on("child_added", snap => {
          const m = snap.val();
          displayMessage(m.profile, m.text, m.timestamp);
        });

      } catch (e) {
        console.warn("Firebase not fully configured. Falling back to local visual layout for now.");
        chatProfSel.disabled = false;
      }
    }

    // PROFILE SELECTION
    chatProfSel.addEventListener("change", () => {
      currentProfile = chatProfSel.value;
      chatInp.disabled = false;
      chatBtn.disabled = false;
      chatInp.placeholder = "Type a message...";
    });

    // SEND MESSAGE
    chatBtn.onclick = sendMessage;
    chatInp.onkeypress = e => { if (e.key === "Enter") sendMessage(); };

    function sendMessage() {
      if (!currentRoom || !currentProfile) return;
      const text = chatInp.value.trim();
      if (!text) return;

      if (messagesRef) {
        try {
          messagesRef.push({
            profile: currentProfile,
            text,
            timestamp: Date.now()
          });
        } catch (e) {
          // If Firebase push fails, just display it locally
          displayMessage(currentProfile, text, Date.now());
        }
      } else {
        // Fallback: display message locally if no Firebase ref
        displayMessage(currentProfile, text, Date.now());
      }

      chatInp.value = "";
    }

    // DISPLAY
    function displayMessage(profile, text, ts) {
      const pColor = { Dragon: '#ef4444', Cat: '#a8a29e', Dog: '#d97706', Kitsune: '#f97316' }[profile] || '#fff';
      const time = new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Clean default join msg if it's the first real msg
      if (chatMsgs.innerHTML.includes("Joined")) {
        chatMsgs.innerHTML = "";
      }

      const div = document.createElement('div');
      div.className = 'message';

      const escapedText = text.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

      div.innerHTML = `<span class="profile-name" style="color:${pColor};">${profile}:</span><span>${escapedText}</span><span class="timestamp">${time}</span>`;
      chatMsgs.appendChild(div);
      chatMsgs.scrollTop = chatMsgs.scrollHeight;
    }

    // CLEANUP
    window.addEventListener("beforeunload", () => {
      if (typingRef && currentRoom) typingRef.child(userId).remove();
    });

    // ------------------------------------
    // 8. DRAGON BATTLE ROYALE
    // ------------------------------------
    const canvas = document.getElementById('dragon-royale');
    const ctx = canvas ? canvas.getContext('2d') : null;
    let drGameLoop;
    let drIsDeploying = false;

    // Config
    const MAP_SIZE = 2000;
    const DRAGON_EMOJIS = ['🐲', '🦖', '🦕', '🐉', '🐊'];
    const PLAYER_SPEED = 4;
    const BOT_SPEED = 2.5;

    // Game State
    let drEntities = []; // Index 0 is player
    let drProjectiles = [];
    let drStorm = { radius: MAP_SIZE, x: MAP_SIZE/2, y: MAP_SIZE/2, shrinkRate: 0.15 };
    let keys = { w: false, a: false, s: false, d: false };
    let mousePos = { x: 300, y: 200 };
    let cam = { x: 0, y: 0 };
    let frameCount = 0;

    if(canvas) {
      window.addEventListener('keydown', e => { 
        if(["w","a","s","d"].includes(e.key.toLowerCase())) keys[e.key.toLowerCase()] = true; 
      });
      window.addEventListener('keyup', e => { 
        if(["w","a","s","d"].includes(e.key.toLowerCase())) keys[e.key.toLowerCase()] = false; 
      });
      
      canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mousePos.x = (e.clientX - rect.left) * (canvas.width / rect.width);
        mousePos.y = (e.clientY - rect.top) * (canvas.height / rect.height);
      });

      canvas.addEventListener('mousedown', e => {
        if (!drIsDeploying || drEntities.length === 0 || drEntities[0].isDead) return;
        
        // Player shoots
        const p = drEntities[0];
        if (p.cooldown > 0) return;
        
        const worldMouseX = mousePos.x + cam.x;
        const worldMouseY = mousePos.y + cam.y;
        const angle = Math.atan2(worldMouseY - p.y, worldMouseX - p.x);
        
        drProjectiles.push({
          ownerId: p.id,
          x: p.x, y: p.y,
          vx: Math.cos(angle) * 10, vy: Math.sin(angle) * 10,
          radius: 8
        });
        p.cooldown = 15; // 15 frames cooldown
      });
    }

    function spawnEntities() {
      drEntities = [];
      // Player
      drEntities.push({
        id: 0, isPlayer: true,
        x: Math.random() * MAP_SIZE, y: Math.random() * MAP_SIZE,
        emoji: '🐉', hp: 100, maxHp: 100, radius: 15, cooldown: 0, isDead: false
      });
      
      // 49 Bots
      for(let i = 1; i <= 49; i++) {
        drEntities.push({
          id: i, isPlayer: false,
          x: Math.random() * MAP_SIZE, y: Math.random() * MAP_SIZE,
          emoji: DRAGON_EMOJIS[Math.floor(Math.random() * DRAGON_EMOJIS.length)],
          hp: 100, maxHp: 100, radius: 15, cooldown: 0, isDead: false,
          targetX: Math.random() * MAP_SIZE, targetY: Math.random() * MAP_SIZE,
          state: 'roam' // roam, fight, run_storm
        });
      }
    }

    window.startDragonRoyale = function() {
      document.getElementById('dr-overlay').style.display = 'none';
      document.getElementById('dr-score-hud').style.display = 'block';
      document.getElementById('dr-score').textContent = 50;
      
      drProjectiles = [];
      drStorm = { radius: MAP_SIZE, x: MAP_SIZE/2, y: MAP_SIZE/2, shrinkRate: 0.15 };
      keys = { w: false, a: false, s: false, d: false };
      frameCount = 0;
      
      drIsDeploying = true;
      spawnEntities();
      
      if (drGameLoop) cancelAnimationFrame(drGameLoop);
      drUpdate();
    };

    function drEndGame(placed) {
      drIsDeploying = false;
      document.getElementById('dr-overlay').style.display = 'flex';
      
      const title = document.getElementById('dr-title');
      const finalScore = document.getElementById('dr-score-display');
      finalScore.style.display = 'block';
      
      if (placed === 1 && !drEntities[0].isDead) {
        title.textContent = 'VICTORY ROYALE 👑';
        title.style.color = '#fbbf24';
        finalScore.textContent = 'You are the last dragon standing!';
      } else {
        title.textContent = 'ELIMINATED 💀';
        title.style.color = '#ef4444';
        finalScore.textContent = 'Placed: #' + placed;
      }
    }

    function drUpdate() {
      if (!drIsDeploying) return;
      drGameLoop = requestAnimationFrame(drUpdate);
      frameCount++;
      
      let aliveCount = 0;
      
      // Update Entities
      for (let i = 0; i < drEntities.length; i++) {
        let e = drEntities[i];
        if (e.isDead) continue;
        aliveCount++;
        
        if (e.cooldown > 0) e.cooldown--;
        
        // 1. Move
        if (e.isPlayer) {
          if (keys.w && e.y - e.radius > 0) e.y -= PLAYER_SPEED;
          if (keys.s && e.y + e.radius < MAP_SIZE) e.y += PLAYER_SPEED;
          if (keys.a && e.x - e.radius > 0) e.x -= PLAYER_SPEED;
          if (keys.d && e.x + e.radius < MAP_SIZE) e.x += PLAYER_SPEED;
        } else {
          // AI Logic
          
          // Check storm distance
          const distToStormCenter = Math.hypot(e.x - drStorm.x, e.y - drStorm.y);
          if (distToStormCenter > drStorm.radius - 100) {
            e.state = 'run_storm';
            e.targetX = drStorm.x; e.targetY = drStorm.y;
          } else if (e.state === 'run_storm') {
            e.state = 'roam'; // Safe now
          }
          
          // Look for enemies if not running purely from storm
          if (e.state !== 'run_storm' && frameCount % 30 === 0) {
            let closestDist = 400; // aggro range
            let closestEnemy = null;
            for (let other of drEntities) {
              if (other.id === e.id || other.isDead) continue;
              const dist = Math.hypot(e.x - other.x, e.y - other.y);
              if (dist < closestDist) {
                closestDist = dist;
                closestEnemy = other;
              }
            }
            if (closestEnemy) {
              e.state = 'fight';
              e.targetEnemy = closestEnemy;
            } else {
              e.state = 'roam';
            }
          }
          
          if (e.state === 'fight' && e.targetEnemy && !e.targetEnemy.isDead) {
            const dist = Math.hypot(e.x - e.targetEnemy.x, e.y - e.targetEnemy.y);
            if (dist > 150) {
              e.targetX = e.targetEnemy.x;
              e.targetY = e.targetEnemy.y;
            } else {
              e.targetX = e.x; e.targetY = e.y;
            }
            
            // Shoot
            if (e.cooldown <= 0 && dist < 400) {
              const aimError = (Math.random() - 0.5) * 0.3;
              const angle = Math.atan2(e.targetEnemy.y - e.y, e.targetEnemy.x - e.x) + aimError;
              drProjectiles.push({
                ownerId: e.id,
                x: e.x, y: e.y,
                vx: Math.cos(angle) * 8, vy: Math.sin(angle) * 8,
                radius: 8
              });
              e.cooldown = 40; // Bots shoot slower
            }
          }
          
          if (e.state === 'roam' && frameCount % 60 === 0) {
            e.targetX = e.x + (Math.random() - 0.5) * 400;
            e.targetY = e.y + (Math.random() - 0.5) * 400;
            e.targetX = Math.max(50, Math.min(MAP_SIZE-50, e.targetX));
            e.targetY = Math.max(50, Math.min(MAP_SIZE-50, e.targetY));
          }
          
          if (e.targetX && e.targetY) {
            const angle = Math.atan2(e.targetY - e.y, e.targetX - e.x);
            const dist = Math.hypot(e.targetX - e.x, e.targetY - e.y);
            if (dist > 5) {
              e.x += Math.cos(angle) * BOT_SPEED;
              e.y += Math.sin(angle) * BOT_SPEED;
            }
          }
          
          e.x = Math.max(e.radius, Math.min(MAP_SIZE-e.radius, e.x));
          e.y = Math.max(e.radius, Math.min(MAP_SIZE-e.radius, e.y));
        }
        
        // Storm Damage
        const distCenter = Math.hypot(e.x - drStorm.x, e.y - drStorm.y);
        if (distCenter > drStorm.radius) {
          e.hp -= 0.5; // Tick damage
        }
        
        // Die?
        if (e.hp <= 0 && !e.isDead) {
          e.isDead = true;
          if (e.isPlayer) {
            drEndGame(aliveCount); // player died, gets whatever placement
          }
        }
      }
      
      document.getElementById('dr-score').textContent = aliveCount;
      
      // Update Projectiles
      for (let i = drProjectiles.length - 1; i >= 0; i--) {
        let p = drProjectiles[i];
        p.x += p.vx; p.y += p.vy;
        
        if (p.x < 0 || p.x > MAP_SIZE || p.y < 0 || p.y > MAP_SIZE) {
          drProjectiles.splice(i, 1);
          continue;
        }
        
        let hit = false;
        for (let e of drEntities) {
          if (e.isDead || e.id === p.ownerId) continue;
          const dist = Math.hypot(p.x - e.x, p.y - e.y);
          if (dist < p.radius + e.radius) {
            e.hp -= 25;
            hit = true;
            break;
          }
        }
        if (hit) drProjectiles.splice(i, 1);
      }
      
      if (aliveCount === 1 && !drEntities[0].isDead) {
        drEndGame(1);
      }
      
      // Storm Shrink
      drStorm.radius -= drStorm.shrinkRate;
      if (drStorm.radius < 50) drStorm.radius = 50;

      drRender();
    }

    function drRender() {
      const p = drEntities[0];
      
      if (!p.isDead) {
        cam.x = p.x - canvas.width / 2;
        cam.y = p.y - canvas.height / 2;
      }
      
      cam.x = Math.max(0, Math.min(MAP_SIZE - canvas.width, cam.x));
      cam.y = Math.max(0, Math.min(MAP_SIZE - canvas.height, cam.y));
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.save();
      ctx.translate(-cam.x, -cam.y);
      
      // Map Background
      ctx.fillStyle = '#166534';
      ctx.fillRect(0, 0, MAP_SIZE, MAP_SIZE);
      
      // Safe Zone
      ctx.beginPath();
      ctx.arc(drStorm.x, drStorm.y, drStorm.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#22c55e'; // Green grass
      ctx.fill();
      
      // Storm Overlay
      ctx.beginPath();
      ctx.rect(0, 0, MAP_SIZE, MAP_SIZE);
      ctx.arc(drStorm.x, drStorm.y, drStorm.radius, 0, Math.PI * 2, true);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.fill();
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      for (let e of drEntities) {
        if (e.isDead) {
          ctx.font = '20px Arial';
          ctx.fillText('🦴', e.x, e.y);
          continue;
        }
        
        ctx.save();
        ctx.translate(e.x, e.y);
        
        let pAngle = 0;
        if (e.isPlayer) {
          pAngle = Math.atan2((mousePos.y + cam.y) - e.y, (mousePos.x + cam.x) - e.x);
        } else if (e.state === 'fight' && e.targetEnemy) {
          pAngle = Math.atan2(e.targetEnemy.y - e.y, e.targetEnemy.x - e.x);
        } else if (e.targetX) {
          pAngle = Math.atan2(e.targetY - e.y, e.targetX - e.x);
        }
        
        if (Math.abs(pAngle) > Math.PI / 2) {
          ctx.scale(-1, 1);
        }
        
        ctx.font = '30px Arial';
        ctx.fillText(e.emoji, 0, 0);
        ctx.restore();
        
        // Healthbar
        ctx.fillStyle = 'red';
        ctx.fillRect(e.x - 15, e.y - 25, 30, 4);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(e.x - 15, e.y - 25, 30 * (e.hp / e.maxHp), 4);
      }
      
      ctx.fillStyle = '#fbbf24';
      drProjectiles.forEach(pr => {
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, pr.radius, 0, Math.PI*2);
        ctx.fill();
      });
      
      ctx.restore();
    }

