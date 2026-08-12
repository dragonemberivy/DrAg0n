    // ------------------------------------
    // 1. CLOCK
    // ------------------------------------
    function updateClock() {
      const now = new Date();
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayName = days[now.getDay()];
      const date = now.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
      const time = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const clockEl = document.getElementById('clock');
      if(clockEl) clockEl.textContent = `${dayName}, ${date} – ${time}`;
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
        
        // Win condition
        if (memCardsMatched === cardsArray.length / 2) {
          setTimeout(() => {
            alert(`You won in ${memMoves} moves!`);
            if(window.addXP) window.addXP(50);
            
            // Firebase Leaderboard (fewest moves wins)
            if(typeof firebase !== 'undefined' && localStorage.getItem('drag0n_user')) {
              const u = localStorage.getItem('drag0n_user');
              const a = localStorage.getItem('drag0n_avatar') || '✨';
              const ref = firebase.database().ref('leaderboards/memory/' + u.toLowerCase());
              ref.once('value').then(snap => {
                const existing = snap.val();
                if(!existing || memMoves < existing.score) {
                  ref.set({ username: u, avatar: a, score: memMoves, timestamp: Date.now() });
                }
              });
            }
          }, 300);
        }
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
    if(document.getElementById('memory-game')) createMemoryBoard();

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

    if (rSlider && gSlider && bSlider && colorPreview) {
      rSlider.oninput = gSlider.oninput = bSlider.oninput = updatePreview;
      updatePreview();

      document.querySelectorAll(".colorable").forEach(el => {
        el.addEventListener("click", e => {
          e.stopPropagation();
          undoStack.push({ element: el, oldColor: el.getAttribute("fill") });
          el.setAttribute("fill", getCurrentColor());
        });
      });

      const undoBtn = document.getElementById("undoBtn");
      if (undoBtn) {
        undoBtn.onclick = () => {
          if (undoStack.length === 0) return;
          const last = undoStack.pop();
          last.element.setAttribute("fill", last.oldColor || '#fff');
        };
      }
    }

    // ------------------------------------
    // 6. EMOJI HUNTS
    // ------------------------------------
    function setupEmojiHunt(boxId, scoreId, emojisList, targetCount, secretCode) {
      const container = document.getElementById(boxId);
      const scoreDisp = document.getElementById(scoreId);
      const popSound = document.getElementById('pop-sound');
      if (!container || !scoreDisp || !popSound) return;
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
    function getDailyPasswords() {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const today = dayNames[new Date().getDay()];
      const visitor = {
        "Monday": "pistachio",
        "Tuesday": "mango",
        "Wednesday": "strawberry",
        "Thursday": "mint",
        "Friday": "guava",
        "Saturday": "vanilla",
        "Sunday": "chocolate"
      }[today];
      const owner = {
        "Monday": "rose",
        "Tuesday": "tulip",
        "Wednesday": "daisy",
        "Thursday": "sunflower",
        "Friday": "lily",
        "Saturday": "orchid",
        "Sunday": "lotus"
      }[today];
      return { visitor, owner };
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
      const pws = getDailyPasswords();
      
      if (pw === pws.owner) {
        // Owner Mode
        localStorage.setItem('drag0n_owner', 'true');
        sessionStorage.setItem('site_unlocked', 'true');
        siteModal.style.display = 'none';
        document.body.style.overflow = 'auto';
      } else if (pw === pws.visitor) {
        // Visitor Mode
        localStorage.setItem('drag0n_owner', 'false');
        sessionStorage.setItem('site_unlocked', 'true');
        siteModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Track Visitor
        if (!sessionStorage.getItem('visited_today')) {
          const dateStr = new Date().toISOString().split('T')[0];
          const dbRef = firebase.database().ref('analytics/daily_visits/' + dateStr);
          dbRef.transaction((current_value) => {
            return (current_value || 0) + 1;
          });
          sessionStorage.setItem('visited_today', 'true');
        }
        
        // Redirect to register if no account
        if (!localStorage.getItem('drag0n_user') && window.location.pathname.endsWith('index.html')) {
          const rm = document.getElementById('register-modal'); if(rm) rm.style.display = 'flex';
        }
      } else {
        sitePwError.style.display = 'block';
        sitePwInput.value = '';
        sitePwInput.focus();
      }
    }

    if(siteUnlockBtn) { siteUnlockBtn.addEventListener('click', tryUnlock); }
    if(sitePwInput) { sitePwInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') tryUnlock();
    }); }

    if (siteModal) {
      siteModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      if (sitePwInput) sitePwInput.focus();
    }

    window.addEventListener('load', () => {
      if(sitePwInput) sitePwInput.focus();
    });

    // ROOM SELECTION
    let pendingRoomKey = null;
    const pwModal = document.getElementById('password-modal');
    const pwInput = document.getElementById('modal-pw-input');
    const pwError = document.getElementById('modal-error');

    if(chatRoomSel) { chatRoomSel.addEventListener("change", () => {
      const roomKey = chatRoomSel.value;
      if (!roomKey) return;

      pendingRoomKey = roomKey;
      document.getElementById('modal-title').textContent = `Join ${ROOMS[roomKey].name}`;
      pwInput.value = '';
      pwError.style.display = 'none';
      pwModal.style.display = 'flex';
      pwInput.focus();
    }); }

    if(document.getElementById('modal-join-btn')) { document.getElementById('modal-join-btn').addEventListener('click', async () => {
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
    }); }

    if(document.getElementById('modal-cancel-btn')) { document.getElementById('modal-cancel-btn').addEventListener('click', () => {
      pwModal.style.display = 'none';
      chatRoomSel.value = currentRoom || "";
      pendingRoomKey = null;
    }); }

    // Allow enter key in modal
    if(pwInput) { pwInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('modal-join-btn').click();
      }
    }); }

    function enterRoom(roomKey) {
      currentRoom = roomKey;
      chatMsgs.innerHTML = `<div style="text-align:center;color:#34d399;margin-top:10px;font-weight:700;">🟢 Joined ${ROOMS[roomKey].name} Channel! Type a message below.</div>`;

      const savedUser = localStorage.getItem('drag0n_user');
      currentProfile = savedUser || (chatProfSel && chatProfSel.value ? chatProfSel.value : 'Dragon') || 'Dragon';

      const statusEl = document.getElementById('chat-status-text');
      if (statusEl) statusEl.textContent = `Connected: ${ROOMS[roomKey].name} Channel`;

      if(chatInp) {
        chatInp.disabled = false;
        chatInp.placeholder = "Type a message or use /roll, /flip, /joke...";
      }
      if(chatBtn) {
        chatBtn.disabled = false;
      }

      // Attempt to load from Firebase if configured
      try {
        messagesRef = db.ref(`rooms/${roomKey}/messages`);
        typingRef = db.ref(`rooms/${roomKey}/typing`);

        messagesRef.limitToLast(100).on("child_added", snap => {
          const m = snap.val();
          displayMessage(m.profile, m.text, m.timestamp);
        });

      } catch (e) {
        console.warn("Firebase not fully configured. Falling back to local visual layout for now.");
      }
    }

    // PROFILE SELECTION (OPTIONAL SWAP)
    if(chatProfSel) {
      chatProfSel.addEventListener("change", () => {
        currentProfile = chatProfSel.value;
      });
    }

    // QUICK STICKERS & COMMAND CHIPS
    window.sendQuickSticker = function(stickerText) {
      if (!currentRoom) {
        alert("Please select a room channel first!");
        return;
      }
      if (chatInp) {
        chatInp.value = stickerText;
        sendMessage();
      }
    };

    // SEND MESSAGE
    if(chatBtn) { chatBtn.onclick = sendMessage; }
    if(chatInp) { chatInp.onkeypress = e => { if (e.key === "Enter") sendMessage(); }; }

    function sendMessage() {
      if (!currentRoom || !currentProfile) return;
      let text = chatInp.value.trim();
      if (!text) return;

      // Handle Dragon Bot Commands
      if (text.toLowerCase() === '/roll') {
        const rollVal = Math.floor(Math.random() * 100) + 1;
        text = `🎲 [Dice Roll] rolled ${rollVal}/100!`;
      } else if (text.toLowerCase() === '/flip') {
        const coin = Math.random() < 0.5 ? 'Heads 🪙' : 'Tails 🪙';
        text = `🪙 [Coin Flip] Result: ${coin}!`;
      } else if (text.toLowerCase() === '/joke') {
        const dragonJokes = [
          "Why are dragons great musicians? Because they really know how to scale!",
          "What do dragons eat for dinner? Fire-grilled cheese!",
          "How do dragons send messages? By thermal mail!",
          "Why did the dragon cross the road? To get to the hoard on the other side!"
        ];
        text = `💡 [Dragon Joke] ${dragonJokes[Math.floor(Math.random() * dragonJokes.length)]}`;
      }

      if (messagesRef) {
        try {
          messagesRef.push({
            profile: currentProfile,
            text,
            timestamp: Date.now()
          });
        } catch (e) {
          displayMessage(currentProfile, text, Date.now());
        }
      } else {
        displayMessage(currentProfile, text, Date.now());
      }

      if (window.addXP) window.addXP(5);
      chatInp.value = "";
    }

    // DISPLAY WITH REACTION BUTTONS
    function displayMessage(profile, text, ts) {
      const pColor = { Dragon: '#ef4444', Cat: '#a8a29e', Dog: '#d97706', Kitsune: '#f97316' }[profile] || '#38bdf8';
      const time = new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (chatMsgs.innerHTML.includes("Joined")) {
        chatMsgs.innerHTML = "";
      }

      const div = document.createElement('div');
      div.className = 'message';
      div.style.cssText = 'display:flex; flex-direction:column; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); padding:8px 12px; border-radius:12px; margin-bottom:8px;';

      const escapedText = text.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

      div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <strong style="color:${pColor}; font-size:0.88rem;">${profile}</strong>
          <span style="font-size:0.7rem; color:#64748b;">${time}</span>
        </div>
        <div style="font-size:0.95rem; color:#f8fafc; word-break:break-word;">${escapedText}</div>
        <div style="display:flex; gap:6px; margin-top:6px; opacity:0.8;">
          <button onclick="this.textContent = (parseInt(this.textContent || '0')+1) + ' ❤️'" style="background:rgba(255,255,255,0.05); border:none; color:#cbd5e1; padding:2px 8px; border-radius:9999px; font-size:0.7rem; cursor:pointer; box-shadow:none;">❤️ 0</button>
          <button onclick="this.textContent = (parseInt(this.textContent || '0')+1) + ' 🔥'" style="background:rgba(255,255,255,0.05); border:none; color:#cbd5e1; padding:2px 8px; border-radius:9999px; font-size:0.7rem; cursor:pointer; box-shadow:none;">🔥 0</button>
          <button onclick="this.textContent = (parseInt(this.textContent || '0')+1) + ' 🐉'" style="background:rgba(255,255,255,0.05); border:none; color:#cbd5e1; padding:2px 8px; border-radius:9999px; font-size:0.7rem; cursor:pointer; box-shadow:none;">🐉 0</button>
        </div>
      `;
      chatMsgs.appendChild(div);
      chatMsgs.scrollTop = chatMsgs.scrollHeight;
    }

    // BOOK CLUB QUIZ GAME
    window.answerBookQuiz = function(idx) {
      const resEl = document.getElementById('quiz-result-msg');
      if (!resEl) return;
      resEl.style.display = 'block';
      if (idx === 0) {
        resEl.style.color = '#34d399';
        resEl.textContent = '🎉 Correct! Sir Arthur Conan Doyle created Sherlock Holmes! +50 Dragon Coins & XP Earned!';
        if (window.addXP) window.addXP(50);
      } else {
        resEl.style.color = '#ef4444';
        resEl.textContent = '❌ Not quite! Sir Arthur Conan Doyle created Sherlock Holmes. Try again!';
      }
    };

    // CLEANUP
    window.addEventListener("beforeunload", () => {
      if (typingRef && currentRoom) typingRef.child(userId).remove();
    });

    // ------------------------------------
    // 8. BOOK CLUB ADVANCED FEATURES
    // ------------------------------------
    
    // A. 30 Book Schedule Generator
    const masterBookList = [
      { "title": "Sherlock Holmes", "author": "Sir Arthur Conan Doyle", "img": "https://covers.openlibrary.org/b/id/14578051-M.jpg", "gutenbergUrl": "https://www.gutenberg.org/ebooks/1661", "publicDomain": true },
      { "title": "Dracula", "author": "Bram Stoker", "img": "https://covers.openlibrary.org/b/id/14577884-M.jpg", "gutenbergUrl": "https://www.gutenberg.org/ebooks/345", "publicDomain": true },
      { "title": "Frankenstein", "author": "Mary Shelley", "img": "https://covers.openlibrary.org/b/id/14577908-M.jpg", "gutenbergUrl": "https://www.gutenberg.org/ebooks/84", "publicDomain": true },
      { "title": "Alice in Wonderland", "author": "Lewis Carroll", "img": "https://covers.openlibrary.org/b/id/14577897-M.jpg", "gutenbergUrl": "https://www.gutenberg.org/ebooks/11", "publicDomain": true },
      { "title": "The Wizard of Oz", "author": "L. Frank Baum", "img": "https://covers.openlibrary.org/b/id/14577892-M.jpg", "gutenbergUrl": "https://www.gutenberg.org/ebooks/55", "publicDomain": true },
      { "title": "Dr. Jekyll & Mr. Hyde", "author": "Robert Louis Stevenson", "img": "https://covers.openlibrary.org/b/id/14577912-M.jpg", "gutenbergUrl": "https://www.gutenberg.org/ebooks/43", "publicDomain": true },
      { "title": "Peter and Wendy", "author": "J. M. Barrie", "img": "https://covers.openlibrary.org/b/id/14577900-M.jpg", "gutenbergUrl": "https://www.gutenberg.org/ebooks/16", "publicDomain": true },
      { "title": "The Count of Monte Cristo", "author": "Alexandre Dumas", "img": "https://covers.openlibrary.org/b/id/14560865-M.jpg", "gutenbergUrl": "https://www.gutenberg.org/ebooks/1184", "publicDomain": true },
      { "title": "The Three Musketeers", "author": "Alexandre Dumas", "img": "https://covers.openlibrary.org/b/id/14577915-M.jpg", "gutenbergUrl": "https://www.gutenberg.org/ebooks/1257", "publicDomain": true },
      { "title": "20,000 Leagues Under Sea", "author": "Jules Verne", "img": "https://covers.openlibrary.org/b/id/14577920-M.jpg", "gutenbergUrl": "https://www.gutenberg.org/ebooks/164", "publicDomain": true },
      { "title": "Treasure Island", "author": "Robert Louis Stevenson", "img": "https://covers.openlibrary.org/b/id/14577925-M.jpg", "gutenbergUrl": "https://www.gutenberg.org/ebooks/120", "publicDomain": true },
      { "title": "Picture of Dorian Gray", "author": "Oscar Wilde", "img": "https://covers.openlibrary.org/b/id/14577930-M.jpg", "gutenbergUrl": "https://www.gutenberg.org/ebooks/174", "publicDomain": true },
      { "title": "A Princess of Mars", "author": "Edgar Rice Burroughs", "img": "https://covers.openlibrary.org/b/id/12678945-M.jpg", "gutenbergUrl": "https://www.gutenberg.org/ebooks/62", "publicDomain": true },
      { "title": "The Hunger Games", "img": "https://covers.openlibrary.org/b/id/12646537-M.jpg" },
      { "title": "I Am Malala", "img": "https://covers.openlibrary.org/b/id/9358664-M.jpg" },
      { "title": "A Wrinkle in Time", "img": "https://covers.openlibrary.org/b/id/8709146-M.jpg" },
      { "title": "The Hobbit", "img": "https://covers.openlibrary.org/b/id/14627509-M.jpg" },
      { "title": "Ender's Game", "img": "https://covers.openlibrary.org/b/id/12996033-M.jpg" },
      { "title": "The Giver", "img": "https://covers.openlibrary.org/b/id/8352502-M.jpg" },
      { "title": "Legendborn", "img": "https://covers.openlibrary.org/b/id/10323535-M.jpg" },
      { "title": "The Golden Compass", "img": "https://covers.openlibrary.org/b/id/2762159-M.jpg" },
      { "title": "Divergent", "img": "https://covers.openlibrary.org/b/id/13274634-M.jpg" },
      { "title": "Coraline", "img": "https://covers.openlibrary.org/b/id/14171421-M.jpg" },
      { "title": "Wonder", "img": "https://covers.openlibrary.org/b/id/8223160-M.jpg" },
      { "title": "The Book Thief", "img": "https://covers.openlibrary.org/b/id/8153054-M.jpg" },
      { "title": "Cinder", "img": "https://covers.openlibrary.org/b/id/6998634-M.jpg" },
      { "title": "The Outsiders", "img": "https://covers.openlibrary.org/b/id/7263662-M.jpg" },
      { "title": "The Graveyard Book", "img": "https://covers.openlibrary.org/b/id/7099583-M.jpg" },
      { "title": "Bridge to Terabithia", "img": "https://covers.openlibrary.org/b/id/12627341-M.jpg" },
      { "title": "Shadow and Bone", "img": "https://covers.openlibrary.org/b/id/13816048-M.jpg" }
    ];

    const bookContainer = document.getElementById('book-schedule-container');
    const audio = document.getElementById('page-turn-audio');
    if (bookContainer) {
      masterBookList.forEach((book, index) => {
        const div = document.createElement('div');
        div.className = 'book-item';
        div.style.cssText = 'text-align: center; background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: transform 0.2s; position: relative;';
        
        let pdBadge = book.publicDomain ? `<div style="position: absolute; top: 0; left: 0; background: #38bdf8; color: #0f172a; font-weight: bold; padding: 2px 4px; font-size: 0.55rem; border-radius: 8px 0 8px 0; z-index: 2;">FREE</div>` : '';
        let readBadge = book.read ? `<div style="position: absolute; top: 0; right: 0; background: #4ade80; color: #111; font-weight: bold; padding: 2px 5px; font-size: 0.6rem; border-radius: 0 8px 0 8px; z-index: 2;">✅ READ</div>` : '';
        
        div.innerHTML = `
          ${pdBadge}
          ${readBadge}
          <div style="font-size: 0.7rem; color: #a855f7; font-weight: bold; margin-bottom: 2px;">Book ${index + 1}</div>
          <img src="${book.img}" alt="${book.title}" style="width: 100%; aspect-ratio: 2/3; object-fit: cover; border-radius: 4px; margin-bottom: 0.5rem; pointer-events: none; opacity: ${book.read ? '0.6' : '1'}">
          <p style="font-size: 0.8rem; font-weight: bold; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; pointer-events: none; color: ${book.read ? '#aaa' : '#fff'};">${book.title}</p>
        `;
        div.addEventListener('mouseenter', () => {
          if (audio) {
            audio.currentTime = 0;
            audio.volume = 0.2;
            audio.play().catch(e => {});
          }
        });
        if (book.gutenbergUrl) {
          div.addEventListener('click', () => {
            window.open(book.gutenbergUrl, '_blank');
          });
        }
        bookContainer.appendChild(div);
      });
    }

    // B. Star Rating Logic
    const stars = document.querySelectorAll('.star');
    const starText = document.getElementById('star-rating-text');
    let currentRating = 0;

    stars.forEach(star => {
      star.addEventListener('mouseover', function() {
        const val = parseInt(this.getAttribute('data-value'));
        stars.forEach(s => {
          if(parseInt(s.getAttribute('data-value')) <= val) s.style.color = '#fbbf24';
          else s.style.color = 'rgba(255,255,255,0.2)';
        });
      });
      star.addEventListener('mouseout', function() {
        stars.forEach(s => {
          if(parseInt(s.getAttribute('data-value')) <= currentRating) {
            s.style.color = '#fbbf24';
            s.classList.add('active');
          }
          else {
            s.style.color = 'rgba(255,255,255,0.2)';
            s.classList.remove('active');
          }
        });
      });
      star.addEventListener('click', function() {
        currentRating = parseInt(this.getAttribute('data-value'));
        starText.textContent = `You rated it ${currentRating} stars!`;
        starText.style.color = '#4ade80';
      });
    });

    // C. Countdown Timer Logic
    const countdownEl = document.getElementById('meeting-countdown');
    if (countdownEl) {
      // Set target to exactly 14 days from now
      const targetDate = new Date().getTime() + (14 * 24 * 60 * 60 * 1000);
      
      setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;
        
        const d = Math.floor(distance / (1000 * 60 * 60 * 24));
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);
        
        countdownEl.innerHTML = `${d}d ${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
      }, 1000);
    }

    // D. Local Storage Reviews Integration
    const reviewsContainer = document.getElementById('reviews-container');
    
    function loadLocalReviews() {
      const localReviews = JSON.parse(localStorage.getItem('book_club_reviews') || '[]');
      if (localReviews.length > 0 && reviewsContainer) {
        reviewsContainer.innerHTML = ''; // Clear static placeholder
        // Reverse so newest is on top
        localReviews.slice().reverse().forEach(review => {
          const div = document.createElement('div');
          div.style.cssText = 'background: rgba(0,0,0,0.2); padding: 0.8rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 0.5rem;';
          div.innerHTML = `<strong style="color: #38bdf8;">${review.username}:</strong> ${review.text}`;
          reviewsContainer.appendChild(div);
        });
      }
    }
    
    // Load immediately
    loadLocalReviews();

    // Pre-fill username if exists
    window.addEventListener('load', () => {
      const usernameInput = document.getElementById('review-username');
      if (usernameInput && localStorage.getItem('drag0n_user')) {
        usernameInput.value = localStorage.getItem('drag0n_user');
        usernameInput.disabled = true; // Lock it
      }
    });

    window.saveBookReview = function() {
      const usernameInput = document.getElementById('review-username');
      const textInput = document.getElementById('review-text');
      
      const username = localStorage.getItem('drag0n_user') || (usernameInput ? usernameInput.value.trim() : '') || 'Anonymous';
      const avatar = localStorage.getItem('drag0n_avatar') || '✨';
      const text = textInput.value.trim();
      
      if (!text) {
        alert('Please write some thoughts before saving!');
        return;
      }
      
      const escapedUsername = username.replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
      const escapedText = text.replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
      
      // Save to local storage
      const localReviews = JSON.parse(localStorage.getItem('book_club_reviews') || '[]');
      localReviews.push({ username: escapedUsername, text: escapedText, timestamp: Date.now() });
      localStorage.setItem('book_club_reviews', JSON.stringify(localReviews));
      
      // Add to UI immediately
      if (reviewsContainer) {
        if (reviewsContainer.innerHTML.includes('DragonMaster:')) {
          reviewsContainer.innerHTML = ''; // clear static on first real post
        }
        const div = document.createElement('div');
        div.style.cssText = 'background: rgba(0,0,0,0.2); padding: 0.8rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 0.5rem; animation: pulseGlow 0.5s ease-out;';
        div.innerHTML = `<span style="margin-right: 5px; font-size: 1.2rem;">${avatar.startsWith('data:') ? '<img src="'+avatar+'" style="width:20px;height:20px;border-radius:50%;vertical-align:middle;">' : avatar}</span><strong style="color: #38bdf8;">${escapedUsername}:</strong> ${escapedText}`;
        reviewsContainer.insertBefore(div, reviewsContainer.firstChild);
      }
      
      textInput.value = '';
      usernameInput.value = '';
    };


    // SHOWSTATS COMMAND
    let adminKeys = '';
    document.addEventListener('keydown', (e) => {
      adminKeys += e.key.toLowerCase();
      adminKeys = adminKeys.slice(-9);
      if (adminKeys === 'showstats') {
        if (localStorage.getItem('drag0n_owner') === 'true') {
          const dateStr = new Date().toISOString().split('T')[0];
          firebase.database().ref('analytics/daily_visits/' + dateStr).once('value').then((snapshot) => {
            const count = snapshot.val() || 0;
            alert(`Owner Mode: There have been ${count} visitors today (${dateStr}).`);
          });
        } else {
          alert('Access Denied. You are not the owner.');
        }
      }
    });

    // REGISTRATION LOGIC
    const profileWidget = document.getElementById('profile-widget');
    const registerModal = document.getElementById('register-modal');
    const pwName = document.getElementById('pw-name');
    const pwAvatar = document.getElementById('pw-avatar');
    
    function updateProfileWidget() {
      if(!profileWidget) return;
      const u = localStorage.getItem('drag0n_user');
      const a = localStorage.getItem('drag0n_avatar');
      if(u) {
        let xp = parseInt(localStorage.getItem('drag0n_xp') || '0');
        let level = Math.floor(Math.sqrt(xp / 100)) + 1;
        let nextLvlXp = Math.pow(level, 2) * 100;
        let prevLvlXp = Math.pow(level - 1, 2) * 100;
        let progress = ((xp - prevLvlXp) / (nextLvlXp - prevLvlXp)) * 100;

        
        
        let purchases = JSON.parse(localStorage.getItem('drag0n_purchases') || '{}');
        
        const pwDc = document.getElementById('pw-dc');
        if(pwDc) {
          pwDc.textContent = `${localStorage.getItem('drag0n_dc') || 0} DC`;
        }
        let achievements = JSON.parse(localStorage.getItem('drag0n_achievements') || '[]');
        let nameColor = purchases.chatColor === 'gold' ? '#fbbf24' : 'inherit';
        
        let vipBadge = purchases.badge === 'vip' ? '👑' : '';
        let clanTag = purchases.clan ? `<span style="color:#a855f7; font-size:0.7rem; font-weight:bold;">[${purchases.clan}]</span> ` : '';
        let pet = purchases.pet === 'dragon' ? '🐉' : purchases.pet === 'robot' ? '🤖' : '';
        if(pet) {
          profileWidget.style.position = 'relative';
          if(!document.getElementById('profile-pet')) {
            const petEl = document.createElement('div');
            petEl.id = 'profile-pet';
            petEl.style.cssText = 'position:absolute; top:-15px; right:-15px; font-size:1.5rem; animation: float 3s ease-in-out infinite; pointer-events:none; z-index:100;';
            profileWidget.appendChild(petEl);
          }
          document.getElementById('profile-pet').innerText = pet;
        }

        let borderStyle = purchases.avatarBorder === 'fire' ? 'border: 2px solid #ef4444; box-shadow: 0 0 10px #ef4444;' : '';
        let avatarVal = a || '👤';
        let aHtml = avatarVal.startsWith('data:') ? `<img src="${avatarVal}" style="width:24px;height:24px;border-radius:50%;vertical-align:middle; ${borderStyle}">` : `<span style="${borderStyle} border-radius:50%; padding:2px;">${avatarVal}</span>`;
        
        let achHtml = achievements.map(ach => `<span title="${ach}" style="font-size:0.8rem; margin-right:2px;">🏅</span>`).join('');
        
        pwName.innerHTML = `<div style="line-height:1.2; color:${nameColor};">${clanTag}${vipBadge}${u} <span style="font-size:0.7rem; color:var(--accent-secondary);">Lv.${level}</span> <div style="margin-top:2px;">${achHtml}</div></div>
                            <select onchange="window.changeBackground(this.value)" style="margin-top:2px; font-size:0.7rem; background:transparent; color:var(--text-muted); border:1px solid var(--border); border-radius:4px;" onclick="event.stopPropagation()">
                              <option value="Space">Space</option>
                              <option value="Matrix">Matrix</option>
                              <option value="Ocean">Ocean</option>
                              <option value="Sunset">Sunset</option>
                            </select>

                            <div class="xp-bar-container"><div class="xp-bar-fill" style="width:${progress}%"></div></div>`;
        pwAvatar.innerHTML = aHtml;
      }
    }
    window.addEventListener('load', updateProfileWidget);
    
    if(profileWidget) {
      profileWidget.addEventListener('click', () => {
        if(!localStorage.getItem('drag0n_user')) {
          if (registerModal) registerModal.style.display = 'flex';
        } else {
          alert('You are already registered as ' + localStorage.getItem('drag0n_user') + '!');
        }
      });
    }

    if(document.getElementById('close-register-btn')) {
      document.getElementById('close-register-btn').addEventListener('click', () => {
        if (registerModal) registerModal.style.display = 'none';
      });
    }

    const emojiGrid = document.getElementById('emoji-grid');
    if (emojiGrid) {
      const emojis = ['🦊', '🐉', '🐱', '🐶', '🐙', '🐼', '🐨', '🐸', '🦁', '🐯', '🐰', '🐹', '🐻', '🐷', '🦄', '🐝', '🐢', '🐍', '🦕', '🦖', '🦈', '🐬', '🐧', '🦉', '🦋'];
      const preview = document.getElementById('preview-avatar');
      let selectedAvatar = '✨';

      emojis.forEach(e => {
        const div = document.createElement('div');
        div.style.cssText = 'font-size: 1.5rem; text-align: center; cursor: pointer; padding: 5px; border-radius: 8px; transition: all 0.2s; user-select: none;';
        div.textContent = e;
        div.onclick = () => {
          Array.from(emojiGrid.children).forEach(el => el.style.background = 'transparent');
          div.style.background = 'rgba(56, 189, 248, 0.2)';
          selectedAvatar = e;
          preview.innerHTML = e;
        };
        emojiGrid.appendChild(div);
      });

      const avatarUpload = document.getElementById('avatar-upload');
      if(avatarUpload) {
        avatarUpload.addEventListener('change', function(e) {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
              const canvas = document.createElement('canvas');
              const max_size = 150;
              let width = img.width, height = img.height;
              if (width > height) { if (width > max_size) { height *= max_size / width; width = max_size; } } 
              else { if (height > max_size) { width *= max_size / height; height = max_size; } }
              canvas.width = width; canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
              selectedAvatar = dataUrl;
              preview.innerHTML = `<img src="${dataUrl}" style="width:100%;height:100%;object-fit:cover;">`;
              Array.from(emojiGrid.children).forEach(el => el.style.background = 'transparent');
            };
            img.src = event.target.result;
          };
          reader.readAsDataURL(file);
        });
      }

      const createBtn = document.getElementById('create-account-btn');
      if(createBtn) {
        createBtn.addEventListener('click', async () => {
          const username = document.getElementById('username-input').value.trim();
          const errorEl = document.getElementById('username-error');
          if (!username) { errorEl.textContent = "Please enter a username!"; errorEl.style.display = 'block'; return; }
          if (!/^[a-zA-Z0-9_]+$/.test(username)) { errorEl.textContent = "Letters, numbers, and underscores only!"; errorEl.style.display = 'block'; return; }

          createBtn.disabled = true; createBtn.textContent = "Checking...";
          try {
            if (typeof firebase !== 'undefined') {
              const userRef = firebase.database().ref('users/' + username.toLowerCase());
              const snapshot = await userRef.once('value');
              if (snapshot.exists()) {
                // If username exists, log them in and restore their data
                const userData = snapshot.val();
                localStorage.setItem('drag0n_user', userData.username);
                localStorage.setItem('drag0n_avatar', userData.avatar || '✨');
                
                // Merge DC: keep the higher amount (so they don't lose local refunds/earnings)
                let localDC = parseInt(localStorage.getItem('drag0n_dc') || '0');
                let dbDC = userData.dc || 0;
                let finalDC = Math.max(localDC, dbDC);
                localStorage.setItem('drag0n_dc', finalDC);
                
                // Sync the final DC back to Firebase immediately
                userRef.child('dc').set(finalDC);

                if(userData.xp !== undefined) localStorage.setItem('drag0n_xp', userData.xp);
                if(userData.purchases) localStorage.setItem('drag0n_purchases', JSON.stringify(userData.purchases));
                
                registerModal.style.display = 'none';
                updateProfileWidget();
                
                const siteModal = document.getElementById('site-password-modal');
                if(siteModal && siteModal.style.display !== 'none') {
                  siteModal.style.display = 'none';
                  document.body.style.overflow = 'auto';
                }
              } else {
                await userRef.set({ username: username, avatar: selectedAvatar, created_at: Date.now() });
                localStorage.setItem('drag0n_user', username);
                localStorage.setItem('drag0n_avatar', selectedAvatar);
                registerModal.style.display = 'none';
                updateProfileWidget();
                
                const siteModal = document.getElementById('site-password-modal');
                if(siteModal && siteModal.style.display !== 'none') {
                  siteModal.style.display = 'none';
                  document.body.style.overflow = 'auto';
                }
              }
            }
          } catch(e) {
            errorEl.textContent = "Error: " + (e.message || "Network error"); errorEl.style.display = 'block';
            createBtn.disabled = false; createBtn.textContent = "Enter Website";
          }
        });
      }
    }

    window.addXP = function(amount) {
      if(!localStorage.getItem('drag0n_user') && !localStorage.getItem('drag0n_owner')) return;
      
      // Everyone (including owners) gets DC
      let dcEarned = Math.floor(amount * 2);
      if(dcEarned > 0) {
        let currentDC = parseInt(localStorage.getItem('drag0n_dc') || '0');
        currentDC += dcEarned;
        localStorage.setItem('drag0n_dc', currentDC);
        if(typeof updateProfileWidget === 'function') updateProfileWidget();
      }
      
      // Owners don't get XP
      if(localStorage.getItem('drag0n_owner') === 'true') return; 
      
      let currentXp = parseInt(localStorage.getItem('drag0n_xp') || '0');
      let oldLvl = Math.floor(Math.sqrt(currentXp / 100)) + 1;
      
      currentXp += amount;
      localStorage.setItem('drag0n_xp', currentXp);
      
      // Check Achievements
      if(window.checkAchievements) window.checkAchievements();
      
      let newLvl = Math.floor(Math.sqrt(currentXp / 100)) + 1;
      if(newLvl > oldLvl) {
        const pop = document.getElementById('pop-sound');
        if(pop) pop.play().catch(()=>{});
      }
      updateProfileWidget();
      
      // Sync to firebase
      if(typeof firebase !== 'undefined') {
        firebase.database().ref('users/' + localStorage.getItem('drag0n_user').toLowerCase() + '/xp').set(currentXp);
      }
    };
    
    // Give daily login XP (50) and handle Owner Starter Bonus
    window.addEventListener('load', () => {
      const today = new Date().toISOString().split('T')[0];
      if(localStorage.getItem('drag0n_last_login') !== today) {
        localStorage.setItem('drag0n_last_login', today);
        setTimeout(() => window.addXP(50), 2000);
      }
      
      // Owner 1,000 DC Starter Bonus
      if(localStorage.getItem('drag0n_owner') === 'true' && !localStorage.getItem('drag0n_owner_starter')) {
        localStorage.setItem('drag0n_owner_starter', 'true');
        let currentDC = parseInt(localStorage.getItem('drag0n_dc') || '0');
        localStorage.setItem('drag0n_dc', currentDC + 1000);
        setTimeout(() => { if(typeof updateProfileWidget === 'function') updateProfileWidget(); }, 500);
      }

      // Owner 1,000 DC Refund for the Dragon Pet UI crash
      if(localStorage.getItem('drag0n_owner') === 'true' && !localStorage.getItem('drag0n_owner_refund')) {
        localStorage.setItem('drag0n_owner_refund', 'true');
        let currentDC = parseInt(localStorage.getItem('drag0n_dc') || '0');
        localStorage.setItem('drag0n_dc', currentDC + 1000);
        setTimeout(() => { if(typeof updateProfileWidget === 'function') updateProfileWidget(); }, 500);
      }
    });

    // THEME TOGGLE
    const themeBtn = document.getElementById('theme-toggle');
    if(themeBtn) {
      if(localStorage.getItem('drag0n_theme') === 'light') {
        document.body.classList.add('light-theme');
        themeBtn.textContent = '☀️';
      }
      themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        if(document.body.classList.contains('light-theme')) {
          localStorage.setItem('drag0n_theme', 'light');
          themeBtn.textContent = '☀️';
        } else {
          localStorage.setItem('drag0n_theme', 'dark');
          themeBtn.textContent = '🌙';
        }
      });
    }

    // HTML5 TRAVEL AUDIO PLAYER LOGIC
    const travelPlaylist = [
      { title: "1. #BoxBaddhalaiPoye Full Video Song", url: "assets/audio/travel_playlist/#BoxBaddhalaiPoye Full Video Song With Lyrics ｜ DJ Full Video Songs ｜ Allu Arjun ｜ Pooja Hegde ｜ DSP.webm" },
      { title: "2. A Million Dreams", url: "assets/audio/travel_playlist/A Million Dreams.webm" },
      { title: "3. ABC", url: "assets/audio/travel_playlist/ABC.webm" },
      { title: "4. Aankh Marey (Simmba)", url: "assets/audio/travel_playlist/Aankh Marey (From ＂Simmba＂).webm" },
      { title: "5. Believer", url: "assets/audio/travel_playlist/Believer.webm" },
      { title: "6. Bhool Bhulaiyaa 2 Title Track", url: "assets/audio/travel_playlist/Bhool Bhulaiyaa 2 Title Track.webm" },
      { title: "7. Billie Jean", url: "assets/audio/travel_playlist/Billie Jean.webm" },
      { title: "8. Blank Space (Taylor's Version)", url: "assets/audio/travel_playlist/Blank Space (Taylor's Version).webm" },
      { title: "9. Box Badhalai Poyi", url: "assets/audio/travel_playlist/Box Badhalai Poyi.webm" },
      { title: "10. Sunny Road to Salina", url: "assets/audio/travel_playlist/CHRISTOPHE-Sunny Road to Salina.webm" },
      { title: "11. Counting Stars", url: "assets/audio/travel_playlist/Counting Stars.webm" },
      { title: "12. Dance Monkey", url: "assets/audio/travel_playlist/Dance Monkey.webm" },
      { title: "13. Day Of Anger", url: "assets/audio/travel_playlist/Day Of Anger.webm" },
      { title: "14. Demons", url: "assets/audio/travel_playlist/Demons.webm" },
      { title: "15. Dippam Dappam", url: "assets/audio/travel_playlist/Dippam Dappam (Telugu) (From ＂Kanmani Rambo Khatija＂).webm" },
      { title: "16. Dj Waley Babu", url: "assets/audio/travel_playlist/Dj Waley Babu.webm" },
      { title: "17. Dynamite", url: "assets/audio/travel_playlist/Dynamite.webm" },
      { title: "18. Empire State Of Mind", url: "assets/audio/travel_playlist/Empire State Of Mind.webm" },
      { title: "19. Follow Follow", url: "assets/audio/travel_playlist/Follow Follow Full Video ｜ Nannaku Prematho ｜ Junior NTR ｜ Rakul Preet Singh ｜ Latest Telugu Songs.webm" },
      { title: "20. Ghungroo (WAR)", url: "assets/audio/travel_playlist/Ghungroo (From ＂WAR＂).webm" },
      { title: "21. Grenade (Acoustic)", url: "assets/audio/travel_playlist/Grenade (Acoustic).webm" },
      { title: "22. Halo", url: "assets/audio/travel_playlist/Halo.webm" },
      { title: "23. Happy", url: "assets/audio/travel_playlist/Happy (From ＂Despicable Me 2＂).webm" },
      { title: "24. Hey Jude", url: "assets/audio/travel_playlist/Hey Jude (Remastered 2015).webm" },
      { title: "25. Hoyna Hoyna", url: "assets/audio/travel_playlist/Hoyna Hoyna (From ＂Gang Leader＂).webm" },
      { title: "26. Illegal Weapon 2.0", url: "assets/audio/travel_playlist/Illegal Weapon 2.0 (From ＂Street Dancer 3D＂).webm" },
      { title: "27. Jai Jai Shivshankar", url: "assets/audio/travel_playlist/Jai Jai Shivshankar (From ＂WAR＂).webm" },
      { title: "28. Jalebi Baby", url: "assets/audio/travel_playlist/Jalebi Baby.webm" },
      { title: "29. Kala Chashma", url: "assets/audio/travel_playlist/Kala Chashma.webm" },
      { title: "30. Kalaavathi", url: "assets/audio/travel_playlist/Kalaavathi.webm" },
      { title: "31. Kinni Kinni", url: "assets/audio/travel_playlist/Kinni Kinni.webm" },
      { title: "32. Levitating", url: "assets/audio/travel_playlist/Levitating (feat. DaBaby).webm" },
      { title: "33. Metallica - Ecstasy Of Gold", url: "assets/audio/travel_playlist/Metallica - Ecstasy Of Gold.webm" },
      { title: "34. Muqabla", url: "assets/audio/travel_playlist/Muqabla (From ＂Street Dancer 3D＂).webm" },
      { title: "35. Naatu Naatu", url: "assets/audio/travel_playlist/Naatu Naatu.webm" },
      { title: "36. Paparazzi", url: "assets/audio/travel_playlist/Paparazzi.webm" },
      { title: "37. Poker Face", url: "assets/audio/travel_playlist/Poker Face.webm" },
      { title: "38. Pranavalaya", url: "assets/audio/travel_playlist/Pranavalaya.webm" },
      { title: "39. Radioactive", url: "assets/audio/travel_playlist/Radioactive.webm" },
      { title: "40. Roar", url: "assets/audio/travel_playlist/Roar.webm" },
      { title: "41. Royals", url: "assets/audio/travel_playlist/Royals.webm" },
      { title: "42. Saiyaara", url: "assets/audio/travel_playlist/Saiyaara (Movie： Saiyaara).webm" },
      { title: "43. Samajavaragamana", url: "assets/audio/travel_playlist/Samajavaragamana.webm" },
      { title: "44. Seeti Maar", url: "assets/audio/travel_playlist/Seeti Maar.webm" },
      { title: "45. Señorita", url: "assets/audio/travel_playlist/Señorita.webm" },
      { title: "46. Sirivennela", url: "assets/audio/travel_playlist/Sirivennela.webm" },
      { title: "47. Somewhere Only We Know", url: "assets/audio/travel_playlist/Somewhere Only We Know.webm" },
      { title: "48. Sugar", url: "assets/audio/travel_playlist/Sugar.webm" },
      { title: "49. The Ecstasy of Gold", url: "assets/audio/travel_playlist/The Ecstasy of Gold - L'Estasi dell'Oro.webm" },
      { title: "50. The Good, The Bad And The Ugly", url: "assets/audio/travel_playlist/The Good, The Bad And The Ugly (2004 Remaster).webm" },
      { title: "51. Thunder", url: "assets/audio/travel_playlist/Thunder.webm" },
      { title: "52. Unwritten", url: "assets/audio/travel_playlist/Unwritten.webm" },
      { title: "53. Uptown Funk", url: "assets/audio/travel_playlist/Uptown Funk.webm" },
      { title: "54. Vikram (Title Track)", url: "assets/audio/travel_playlist/Vikram (Title Track).webm" },
      { title: "55. Waka Waka", url: "assets/audio/travel_playlist/Waka Waka (Esto es Africa).webm" },
      { title: "56. Watermelon Sugar", url: "assets/audio/travel_playlist/Watermelon Sugar.webm" },
      { title: "57. Whatever It Takes", url: "assets/audio/travel_playlist/Whatever It Takes.webm" },
      { title: "58. Yellow", url: "assets/audio/travel_playlist/Yellow.webm" },
      { title: "59. Zorba's Dance", url: "assets/audio/travel_playlist/Zorba the Greek： Zorba's Dance.webm" },
      { title: "60. Master of Puppets (Instrumental)", url: "assets/audio/travel_playlist/master of puppets - Metallica (instrumental).webm" }
    ];

    let currentTrackIdx = 0;

    window.toggleTravelAudio = function() {
      const audio = document.getElementById('travel-audio-element');
      const btn = document.getElementById('travel-play-btn');
      if (!audio || !btn) return;
      if (audio.paused) {
        audio.play().then(() => {
          btn.innerHTML = '⏸ Pause';
          sessionStorage.setItem('travel_audio_playing', 'true');
        }).catch(err => {
          console.log('Audio playback prevented or failed:', err);
        });
      } else {
        audio.pause();
        btn.innerHTML = '▶ Play';
        sessionStorage.setItem('travel_audio_playing', 'false');
      }
    };

    window.changeTravelTrack = function(index) {
      const audio = document.getElementById('travel-audio-element');
      const source = document.getElementById('travel-audio-source');
      const titleSpan = document.getElementById('travel-track-title');
      const btn = document.getElementById('travel-play-btn');
      const select = document.getElementById('travel-track-select');
      
      currentTrackIdx = parseInt(index);
      const track = travelPlaylist[currentTrackIdx] || travelPlaylist[0];

      if (!audio || !source) return;
      const isPlaying = !audio.paused;
      source.src = track.url;
      audio.load();
      if (titleSpan) titleSpan.textContent = track.title;
      if (select) select.value = currentTrackIdx;

      if (isPlaying) {
        audio.play().then(() => {
          if (btn) btn.innerHTML = '⏸ Pause';
        }).catch(e => {});
      }
    };

    window.nextTravelTrack = function() {
      const nextIdx = (currentTrackIdx + 1) % travelPlaylist.length;
      window.changeTravelTrack(nextIdx);
      const audio = document.getElementById('travel-audio-element');
      if (audio) audio.play().catch(e => {});
    };

    window.prevTravelTrack = function() {
      const prevIdx = (currentTrackIdx - 1 + travelPlaylist.length) % travelPlaylist.length;
      window.changeTravelTrack(prevIdx);
      const audio = document.getElementById('travel-audio-element');
      if (audio) audio.play().catch(e => {});
    };

    window.setTravelVolume = function(val) {
      const audio = document.getElementById('travel-audio-element');
      if (audio) audio.volume = parseFloat(val);
    };

    window.toggleMusicPlayer = function() {
      const container = document.getElementById('music-player-iframe-container');
      const btn = document.getElementById('music-toggle-btn');
      if (container) {
        if (container.style.display === 'none') {
          container.style.display = 'flex';
          if (btn) btn.textContent = '➖ Minimize';
        } else {
          container.style.display = 'none';
          if (btn) btn.textContent = '▶️ Expand';
        }
      }
    };

    const travelPlayerHTML = `
      <div id="music-player" style="position:fixed; bottom:24px; right:24px; width:340px; background:rgba(18, 24, 38, 0.88); backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px); border:1px solid rgba(255,255,255,0.12); border-radius:24px; padding:16px; z-index:99999; box-shadow:0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15); display:flex; flex-direction:column; gap:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:36px; height:36px; border-radius:9999px; background:linear-gradient(135deg, rgba(56,189,248,0.2), rgba(192,132,252,0.2)); border:1px solid rgba(56,189,248,0.3); display:flex; align-items:center; justify-content:center; font-size:1.1rem; box-shadow:0 0 15px rgba(56,189,248,0.2);">🎵</div>
            <div>
              <strong style="color:#ffffff; font-size:0.88rem; display:block; font-family:'Outfit', sans-serif; font-weight:800; letter-spacing:-0.01em;">Travel Audio Player</strong>
              <span id="travel-track-title" style="font-size:0.72rem; color:#94a3b8; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;">1. #BoxBaddhalaiPoye</span>
            </div>
          </div>
          <div style="display:flex; gap:6px;">
            <button onclick="window.toggleMusicPlayer()" id="music-toggle-btn" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#e2e8f0; padding:4px 10px; border-radius:9999px; cursor:pointer; font-size:0.72rem; font-weight:700;" title="Minimize / Expand">➖ Minimize</button>
            <button onclick="document.getElementById('music-player').style.display='none'" style="background:transparent; border:none; color:#64748b; cursor:pointer; font-size:1.1rem; padding:2px 6px;" title="Close">&times;</button>
          </div>
        </div>

        <div id="music-player-iframe-container" style="display:flex; flex-direction:column; gap:10px; transition: all 0.3s ease;">
          <audio id="travel-audio-element" style="display:none;" onended="window.nextTravelTrack()">
            <source id="travel-audio-source" src="${travelPlaylist[0].url}" type="audio/webm">
          </audio>

          <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(11,14,23,0.6); padding:8px 12px; border-radius:14px; border:1px solid rgba(255,255,255,0.08); gap:8px;">
            <button onclick="window.prevTravelTrack()" style="background:rgba(255,255,255,0.08); border:none; color:white; padding:5px 10px; border-radius:9999px; cursor:pointer; font-size:0.8rem; box-shadow:none;" title="Previous">⏮</button>
            <button id="travel-play-btn" onclick="window.toggleTravelAudio()" style="background:linear-gradient(135deg, #38bdf8, #818cf8); border:none; color:#0b0e17; padding:6px 16px; border-radius:9999px; font-weight:800; cursor:pointer; font-size:0.82rem; display:flex; align-items:center; gap:4px; box-shadow:0 4px 15px rgba(56,189,248,0.3);">
              ▶ Play
            </button>
            <button onclick="window.nextTravelTrack()" style="background:rgba(255,255,255,0.08); border:none; color:white; padding:5px 10px; border-radius:9999px; cursor:pointer; font-size:0.8rem; box-shadow:none;" title="Next">⏭</button>
            
            <select id="travel-track-select" onchange="window.changeTravelTrack(this.value)" style="background:rgba(11,14,23,0.9); color:white; border:1px solid rgba(255,255,255,0.15); padding:6px 10px; border-radius:10px; font-size:0.75rem; max-width:130px; cursor:pointer; margin:0;">
              ${travelPlaylist.map((t, idx) => `<option value="${idx}">${t.title}</option>`).join('')}
            </select>
          </div>

          <div style="display:flex; align-items:center; justify-content:space-between; font-size:0.75rem; color:#94a3b8;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span>🔊</span>
              <input type="range" id="travel-volume-slider" min="0" max="1" step="0.05" value="0.7" oninput="window.setTravelVolume(this.value)" style="width:75px; accent-color:#38bdf8; cursor:pointer; margin:0;">
            </div>
            <a href="https://music.youtube.com/playlist?list=PLsWhDTkT5AxzWUi6TbQZoIryJFL4-Lly-" target="_blank" style="color:#38bdf8; text-decoration:none; font-weight:700; font-size:0.75rem; display:flex; align-items:center; gap:2px;">
              Original YouTube ↗
            </a>
          </div>
        </div>
      </div>
    `;

    const existingLofi = document.getElementById('lofi-player');
    const existingPlayer = document.getElementById('music-player');
    if (existingLofi) {
      existingLofi.outerHTML = travelPlayerHTML;
    } else if (existingPlayer) {
      existingPlayer.outerHTML = travelPlayerHTML;
    } else {
      document.body.insertAdjacentHTML('beforeend', travelPlayerHTML);
    }

    if (sessionStorage.getItem('travel_audio_playing') === 'true') {
      setTimeout(() => {
        const audio = document.getElementById('travel-audio-element');
        const btn = document.getElementById('travel-play-btn');
        if (audio && btn) {
          audio.play().then(() => {
            btn.innerHTML = '⏸ Pause';
          }).catch(() => {});
        }
      }, 300);
    }

    // CHAT NOTIFICATIONS (On Index)
    if(window.location.pathname.endsWith('index.html') && typeof firebase !== 'undefined') {
      setTimeout(() => {
        try {
          const chatCard = document.querySelector('a[href="chat.html"]');
          if(chatCard) {
            let initialLoad = true;
            firebase.database().ref('chatrooms/Forest/messages').limitToLast(1).on('child_added', (snap) => {
              if(initialLoad) { initialLoad = false; return; }
              // Add badge
              if(!chatCard.querySelector('.chat-badge')) {
                chatCard.style.position = 'relative';
                const badge = document.createElement('div');
                badge.className = 'chat-badge';
                badge.style.cssText = 'position:absolute; top:15px; right:15px; width:15px; height:15px; background:#ef4444; border-radius:50%; box-shadow:0 0 10px #ef4444; animation:pulseGlow 1s infinite;';
                chatCard.appendChild(badge);
              }
            });
          }
        } catch(e){}
      }, 3000); // wait for auth
    }

    window.upvoteReview = function(bookId, reviewKey) {
      if(!localStorage.getItem('drag0n_user')) { alert('Create a profile to upvote!'); return; }
      if(localStorage.getItem('upvoted_'+reviewKey)) { alert('You already upvoted this!'); return; }
      
      localStorage.setItem('upvoted_'+reviewKey, 'true');
      const ref = firebase.database().ref('book_reviews/' + bookId + '/' + reviewKey + '/upvotes');
      ref.transaction(current => (current || 0) + 1);
      if(window.addXP) window.addXP(5); // 5 XP for upvoting!
    };

    // DYNAMIC BACKGROUNDS
    const bgColors = {
      'Space': 'var(--bg-color)',
      'Matrix': '#002200',
      'Ocean': '#001a33',
      'Sunset': '#331a00'
    };
    window.changeBackground = function(themeName) {
      localStorage.setItem('drag0n_bg', themeName);
      applyBackground();
    };
    function applyBackground() {
      const bg = localStorage.getItem('drag0n_bg');
      if(bg && bgColors[bg]) {
        document.body.style.backgroundColor = bgColors[bg];
        if(bg === 'Matrix') document.body.style.backgroundImage = 'radial-gradient(circle, #004400 0%, #001100 100%)';
        else if(bg === 'Ocean') document.body.style.backgroundImage = 'linear-gradient(to bottom, #001a33, #004d99)';
        else if(bg === 'Sunset') document.body.style.backgroundImage = 'linear-gradient(to bottom, #331a00, #993300)';
        else document.body.style.backgroundImage = 'none';
      }
    }
    window.addEventListener('load', applyBackground);

    // EASTER EGG & EMOJI SCAVENGER HUNT ENGINE
    const DRINK_EMOJIS = ['🧋','🧃','🍵','🍵','🧃','🥤','🍹','🥤','🍹','🥤','🧃','🧃','🥤','🧃','🧃','🧋','🥤','🧃','🍵','🍹','🥤','🧃','🍹','🍹','🧋','🧃','🧃','🍵','🧋','🧋'];
    const MONEY_EMOJIS = ['💸','💰','🤑','💸','🤑','🪙','🪙','🪙','🤑','🪙','💸','💰','💵','🤑','💵','🤑','💵','💸','💵','💰','🪙','💵','💵','💵','💸','💵','🤑','🪙','🪙','💸'];

    function getLeftHuntState() {
      let saved = JSON.parse(localStorage.getItem('drag0n_left_hunt') || 'null');
      if (!saved || saved.length !== 30) {
        saved = new Array(30).fill(false);
        saved[0] = true; // Initial 1/30
        localStorage.setItem('drag0n_left_hunt', JSON.stringify(saved));
      }
      return saved;
    }

    function getRightHuntState() {
      let saved = JSON.parse(localStorage.getItem('drag0n_right_hunt') || 'null');
      if (!saved || saved.length !== 30) {
        saved = new Array(30).fill(false); // Initial 0/30
        localStorage.setItem('drag0n_right_hunt', JSON.stringify(saved));
      }
      return saved;
    }

    window.toggleLeftHuntItem = function(idx) {
      let state = getLeftHuntState();
      state[idx] = !state[idx];
      localStorage.setItem('drag0n_left_hunt', JSON.stringify(state));
      if (state[idx] && window.addXP) window.addXP(20);
      window.renderEmojiHuntModal();
    };

    window.toggleRightHuntItem = function(idx) {
      let state = getRightHuntState();
      state[idx] = !state[idx];
      localStorage.setItem('drag0n_right_hunt', JSON.stringify(state));
      if (state[idx] && window.addXP) window.addXP(20);
      window.renderEmojiHuntModal();
    };

    window.redeemHuntCode = function(inputCode) {
      const code = (inputCode || document.getElementById('hunt-code-input')?.value || '').trim().toLowerCase();
      const feedbackEl = document.getElementById('hunt-code-feedback');
      if (code === 'yay') {
        let rightState = new Array(30).fill(true);
        localStorage.setItem('drag0n_right_hunt', JSON.stringify(rightState));
        let curDC = parseInt(localStorage.getItem('drag0n_dc') || '0');
        localStorage.setItem('drag0n_dc', (curDC + 1000).toString());
        if (window.addXP) window.addXP(500);
        if (window.updateProfileWidget) window.updateProfileWidget();
        if (feedbackEl) {
          feedbackEl.style.color = '#34d399';
          feedbackEl.innerText = '🎉 CODE "yay" ACCEPTED! Right Hunt Completed (30/30) & +1,000 Dragon Coins Awarded!';
        }
        window.renderEmojiHuntModal();
      } else {
        if (feedbackEl) {
          feedbackEl.style.color = '#ef4444';
          feedbackEl.innerText = '❌ Invalid code. Try code: yay';
        }
      }
    };

    window.openEmojiHuntModal = function() {
      let modal = document.getElementById('emoji-hunt-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'emoji-hunt-modal';
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(5, 8, 20, 0.92); backdrop-filter:blur(16px); z-index:999999; display:flex; align-items:center; justify-content:center; padding:1rem;';
        document.body.appendChild(modal);
      }
      modal.style.display = 'flex';
      window.renderEmojiHuntModal();
    };

    window.closeEmojiHuntModal = function() {
      const modal = document.getElementById('emoji-hunt-modal');
      if (modal) modal.style.display = 'none';
    };

    window.renderEmojiHuntModal = function() {
      const modal = document.getElementById('emoji-hunt-modal');
      if (!modal) return;

      const leftState = getLeftHuntState();
      const rightState = getRightHuntState();

      const leftCount = leftState.filter(Boolean).length;
      const rightCount = rightState.filter(Boolean).length;

      let leftGridHTML = '';
      DRINK_EMOJIS.forEach((emo, i) => {
        const found = leftState[i];
        leftGridHTML += `<div onclick="window.toggleLeftHuntItem(${i})" style="width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.2rem; cursor:pointer; background:${found ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.04)'}; border:1px solid ${found ? '#38bdf8' : 'rgba(255,255,255,0.08)'}; opacity:${found ? '1' : '0.35'}; transition:all 0.2s;">${emo}</div>`;
      });

      let rightGridHTML = '';
      MONEY_EMOJIS.forEach((emo, i) => {
        const found = rightState[i];
        rightGridHTML += `<div onclick="window.toggleRightHuntItem(${i})" style="width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.2rem; cursor:pointer; background:${found ? 'rgba(251, 191, 36, 0.25)' : 'rgba(255,255,255,0.04)'}; border:1px solid ${found ? '#fbbf24' : 'rgba(255,255,255,0.08)'}; opacity:${found ? '1' : '0.35'}; transition:all 0.2s;">${emo}</div>`;
      });

      modal.innerHTML = `
        <div style="background:rgba(18, 24, 38, 0.95); border:1px solid rgba(56, 189, 248, 0.3); border-radius:24px; padding:2rem; max-width:850px; width:100%; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,0.6); position:relative;">
          <button onclick="window.closeEmojiHuntModal()" style="position:absolute; top:20px; right:20px; background:rgba(255,255,255,0.08); border:none; color:#fff; width:36px; height:36px; border-radius:50%; font-size:1.2rem; cursor:pointer;">✕</button>
          
          <h2 style="font-size:2rem; margin-bottom:0.5rem; text-align:center; background:linear-gradient(135deg, #38bdf8, #fbbf24); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Emoji Scavenger Hunt</h2>
          <p style="text-align:center; color:var(--text-muted); font-size:0.95rem; margin-bottom:1.8rem;">Click emojis to collect them or enter secret promo codes to complete the hunt!</p>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(340px, 1fr)); gap:1.5rem;">
            
            <!-- LEFT HUNT CARD -->
            <div style="background:rgba(11, 14, 23, 0.6); border:1px solid rgba(56, 189, 248, 0.3); border-radius:18px; padding:1.5rem;">
              <div style="display:flex; justify-space-between; align-items:center; margin-bottom:1rem;">
                <h3 style="color:#38bdf8; font-size:1.3rem; margin:0;">Left Hunt: ${leftCount}/30</h3>
                <span style="font-size:0.8rem; background:rgba(56, 189, 248, 0.15); color:#38bdf8; padding:3px 10px; border-radius:9999px; font-weight:800;">DRINKS</span>
              </div>
              <div style="display:grid; grid-template-columns:repeat(6, 1fr); gap:8px; margin-bottom:1rem;">
                ${leftGridHTML}
              </div>
              <p style="font-size:0.8rem; color:var(--text-muted); margin:0;">Tap any drink to register collection (${leftCount}/30 completed).</p>
            </div>

            <!-- RIGHT HUNT CARD -->
            <div style="background:rgba(11, 14, 23, 0.6); border:1px solid rgba(251, 191, 36, 0.3); border-radius:18px; padding:1.5rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                <h3 style="color:#fbbf24; font-size:1.3rem; margin:0;">Right Hunt: ${rightCount}/30</h3>
                <span style="font-size:0.8rem; background:rgba(251, 191, 36, 0.15); color:#fbbf24; padding:3px 10px; border-radius:9999px; font-weight:800;">MONEY (Code: yay)</span>
              </div>
              <div style="display:grid; grid-template-columns:repeat(6, 1fr); gap:8px; margin-bottom:1rem;">
                ${rightGridHTML}
              </div>
              
              <!-- Code Redemption Box -->
              <div style="display:flex; gap:8px; margin-top:1rem;">
                <input type="text" id="hunt-code-input" placeholder="Enter code (e.g. yay)..." style="flex:1; padding:8px 12px; font-size:0.9rem; background:rgba(0,0,0,0.4); border:1px solid rgba(251, 191, 36, 0.4); border-radius:10px; color:#fff; margin:0;">
                <button onclick="window.redeemHuntCode()" style="padding:8px 16px; font-weight:800; font-size:0.85rem; background:linear-gradient(135deg, #fbbf24, #f59e0b); color:#0f172a; border:none; border-radius:10px; cursor:pointer;">Redeem</button>
              </div>
              <div id="hunt-code-feedback" style="font-size:0.8rem; font-weight:700; margin-top:8px; min-height:20px;"></div>
            </div>

          </div>
        </div>
      `;
    };

    window.findEgg = function(eggId, element) {
      if (element) element.style.display = 'none';
      let found = JSON.parse(localStorage.getItem('drag0n_eggs') || '[]');
      if(!found.includes(eggId)) {
        found.push(eggId);
        localStorage.setItem('drag0n_eggs', JSON.stringify(found));
        alert(`You found a secret token! (${found.length}/5)`);
        if(window.addXP) window.addXP(100);
        window.openEmojiHuntModal();
      }
    };

    window.checkAchievements = function() {
      let achs = JSON.parse(localStorage.getItem('drag0n_achievements') || '[]');
      let xp = parseInt(localStorage.getItem('drag0n_xp') || '0');
      let level = Math.floor(Math.sqrt(xp / 100)) + 1;
      
      let newAch = null;
      if(level >= 5 && !achs.includes('Level 5')) newAch = 'Level 5';
      if(level >= 10 && !achs.includes('Level 10')) newAch = 'Level 10';
      
      if(newAch) {
        achs.push(newAch);
        localStorage.setItem('drag0n_achievements', JSON.stringify(achs));
        alert('🏆 Achievement Unlocked: ' + newAch);
        if(window.updateProfileWidget) window.updateProfileWidget();
      }
    };


    // GLOBAL WHITEBOARD
    const canvas = document.getElementById('whiteboard-canvas');
    if (canvas && typeof firebase !== 'undefined') {
      const ctx = canvas.getContext('2d');
      let drawing = false;
      let colorInp = document.getElementById('wb-color');
      
      canvas.addEventListener('mousedown', () => drawing = true);
      canvas.addEventListener('mouseup', () => drawing = false);
      canvas.addEventListener('mouseleave', () => drawing = false);
      
      canvas.addEventListener('mousemove', (e) => {
        if(!drawing) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = Math.floor((e.clientX - rect.left) * scaleX);
        const y = Math.floor((e.clientY - rect.top) * scaleY);
        
        const color = colorInp.value;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 4, 4);
        
        firebase.database().ref('whiteboard').push({x, y, color});
      });
      
      // Receive pixels
      firebase.database().ref('whiteboard').on('child_added', snap => {
        const p = snap.val();
        if(p && p.x != null && p.y != null) {
          ctx.fillStyle = p.color || '#fff';
          ctx.fillRect(p.x, p.y, 4, 4);
        }
      });
      firebase.database().ref('whiteboard').on('child_removed', () => {
        ctx.clearRect(0,0,canvas.width,canvas.height);
      });
    }


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


    // DIRECT MESSAGING
    let currentDMUser = null;
    let dmListenerRef = null;
    
    window.openDM = function(targetUser) {
      const myUser = localStorage.getItem('drag0n_user');
      if(!myUser) return alert("You must create a profile to DM!");
      if(targetUser === myUser) return;
      
      currentDMUser = targetUser;
      document.getElementById('dm-target-user').innerText = targetUser;
      document.getElementById('dm-modal').style.display = 'flex';
      
      const container = document.getElementById('dm-messages-container');
      container.innerHTML = '';
      
      // Determine DM channel ID (alphabetical sort to ensure both users write to same path)
      const u1 = myUser.toLowerCase();
      const u2 = targetUser.toLowerCase();
      const dmId = u1 < u2 ? `${u1}_${u2}` : `${u2}_${u1}`;
      
      if(dmListenerRef) dmListenerRef.off();
      
      dmListenerRef = firebase.database().ref('dms/' + dmId);
      dmListenerRef.on('child_added', snap => {
        const msg = snap.val();
        if(msg) {
          const div = document.createElement('div');
          div.style.marginBottom = '5px';
          const isMe = msg.username === myUser;
          div.innerHTML = `<strong style="color: ${isMe ? '#a855f7' : '#fbbf24'};">${msg.username}:</strong> ${msg.text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}`;
          container.appendChild(div);
          container.scrollTop = container.scrollHeight;
        }
      });
    };
    
    const dmForm = document.getElementById('dm-form');
    if(dmForm) {
      dmForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const inp = document.getElementById('dm-input');
        const text = inp.value.trim();
        if(!text || !currentDMUser) return;
        
        const myUser = localStorage.getItem('drag0n_user');
        const u1 = myUser.toLowerCase();
        const u2 = currentDMUser.toLowerCase();
        const dmId = u1 < u2 ? `${u1}_${u2}` : `${u2}_${u1}`;
        
        firebase.database().ref('dms/' + dmId).push({
          username: myUser,
          text: text,
          timestamp: Date.now()
        });
        
        inp.value = '';
        if(window.addXP) window.addXP(5);
      });
    }


    // TRIVIA BOT
    let currentTrivia = null;
    const triviaQuestions = [
      { q: "What is the capital of France?", a: "paris" },
      { q: "What planet is known as the Red Planet?", a: "mars" },
      { q: "What is the largest mammal?", a: "blue whale" },
      { q: "How many legs does a spider have?", a: "8" }
    ];
    
    function startTrivia() {
      if(typeof firebase === 'undefined') return;
      const t = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];
      firebase.database().ref('trivia_active').set({ q: t.q, a: t.a, timestamp: Date.now() });
      firebase.database().ref('animal_chat').push({
        username: 'TriviaBot',
        avatar: '🤖',
        text: `TRIVIA TIME! ${t.q} (First to answer wins 50 XP & 50 DC!)`,
        color: '#fbbf24',
        timestamp: Date.now()
      });
    }
    
    // Listen for active trivia
    if(typeof firebase !== 'undefined') {
      firebase.database().ref('trivia_active').on('value', snap => {
        currentTrivia = snap.val();
      });
    }
    
    window.checkTriviaAnswer = function(text) {
      if(!currentTrivia) return;
      if(text.toLowerCase() === currentTrivia.a.toLowerCase()) {
        firebase.database().ref('animal_chat').push({
          username: 'TriviaBot',
          avatar: '🤖',
          text: `🎉 WINNER! ${localStorage.getItem('drag0n_user')} answered correctly!`,
          color: '#fbbf24',
          timestamp: Date.now()
        });
        if(window.addXP) window.addXP(50);
        let currentDC = parseInt(localStorage.getItem('drag0n_dc') || '0');
        localStorage.setItem('drag0n_dc', currentDC + 50);
        firebase.database().ref('trivia_active').remove();
      }
    };
    
    // Start trivia occasionally if host
    setInterval(() => {
      if(localStorage.getItem('drag0n_owner') === 'true' && !currentTrivia) {
        if(Math.random() < 0.1) startTrivia();
      }
    }, 60000);


    window.queueSong = function() {
      let dc = parseInt(localStorage.getItem('drag0n_dc') || '0');
      if (dc >= 50) {
        const vid = document.getElementById('jukebox-input').value.trim();
        if(vid.length > 5) {
          dc -= 50;
          localStorage.setItem('drag0n_dc', dc);
          if(window.updateShopBalance) window.updateShopBalance();
          
          if(typeof firebase !== 'undefined') {
            firebase.database().ref('global_jukebox').set({ videoId: vid, timestamp: Date.now() });
            firebase.database().ref('animal_chat').push({
              username: 'Jukebox',
              avatar: '🎵',
              text: `${localStorage.getItem('drag0n_user')} queued a new song!`,
              color: '#38bdf8',
              timestamp: Date.now()
            });
          }
          alert('Song queued globally!');
        } else {
          alert('Invalid YouTube Video ID (e.g. jfKfPfyJRdk)');
        }
      } else {
        alert('Not enough DC to queue a song!');
      }
    };
    
    // Global Jukebox Sync
    if(typeof firebase !== 'undefined') {
      firebase.database().ref('global_jukebox').on('value', snap => {
        const s = snap.val();
        if(s && s.videoId) {
          const iframe = document.getElementById('jukebox-iframe');
          if(iframe) {
            const currentSrc = iframe.src;
            if(!currentSrc.includes(s.videoId)) {
              iframe.src = `https://www.youtube.com/embed/${s.videoId}?autoplay=1&loop=1`;
            }
          }
        }
      });
    }
