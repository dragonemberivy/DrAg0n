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
    const savedUser = localStorage.getItem('drag0n_user');
    const savedAvatar = localStorage.getItem('drag0n_avatar');

    if(chatProfSel) {
      if (savedUser) {
        // Auto-login to chat
        currentProfile = savedUser;
        chatProfSel.style.display = 'none'; // hide selector
        if(chatInp) chatInp.disabled = false;
        if(chatBtn) chatBtn.disabled = false;
        if(chatInp) chatInp.placeholder = "Type a message...";
      } else {
        chatProfSel.addEventListener("change", () => {
          currentProfile = chatProfSel.value;
          chatInp.disabled = false;
          chatBtn.disabled = false;
          chatInp.placeholder = "Type a message...";
        });
      }
    }

    // SEND MESSAGE
    if(chatBtn) { chatBtn.onclick = sendMessage; }
    if(chatInp) { chatInp.onkeypress = e => { if (e.key === "Enter") sendMessage(); }; }

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
    // 8. BOOK CLUB ADVANCED FEATURES
    // ------------------------------------
    
    // A. 30 Book Schedule Generator
    const masterBookList = [
      { "title": "The Hunger Games", "img": "https://covers.openlibrary.org/b/id/12646537-M.jpg" },
      { "title": "I Am Malala", "img": "https://covers.openlibrary.org/b/id/9358664-M.jpg" },
      { "title": "The Count of Monte Cristo", "img": "https://covers.openlibrary.org/b/id/14560865-M.jpg" },
      { "title": "A Wrinkle in Time", "img": "https://covers.openlibrary.org/b/id/8709146-M.jpg" },
      { "title": "The Hobbit", "img": "https://covers.openlibrary.org/b/id/14627509-M.jpg" },
      { "title": "Ender's Game", "img": "https://covers.openlibrary.org/b/id/12996033-M.jpg" },
      { "title": "The Giver", "img": "https://covers.openlibrary.org/b/id/8352502-M.jpg" },
      { "title": "Legendborn", "img": "https://covers.openlibrary.org/b/id/10323535-M.jpg" },
      { "title": "The Golden Compass", "img": "https://covers.openlibrary.org/b/id/2762159-M.jpg" },
      { "title": "Divergent", "img": "https://covers.openlibrary.org/b/id/13274634-M.jpg" },
      { "title": "Dry", "img": "https://covers.openlibrary.org/b/id/8813046-M.jpg" },
      { "title": "City of Bones", "img": "https://covers.openlibrary.org/b/id/10121449-M.jpg" },
      { "title": "A Murder Most Unladylike", "img": "https://images.unsplash.com/photo-1544716278-e513176f20b5?w=150&q=80" },
      { "title": "Coraline", "img": "https://covers.openlibrary.org/b/id/14171421-M.jpg" },
      { "title": "Wonder", "img": "https://covers.openlibrary.org/b/id/8223160-M.jpg" },
      { "title": "Truly Devious", "img": "https://covers.openlibrary.org/b/id/8367745-M.jpg" },
      { "title": "Amari and the Night Brothers", "img": "https://covers.openlibrary.org/b/id/12714908-M.jpg" },
      { "title": "The Book Thief", "img": "https://covers.openlibrary.org/b/id/8153054-M.jpg" },
      { "title": "Legend", "img": "https://covers.openlibrary.org/b/id/8243083-M.jpg" },
      { "title": "Scythe", "img": "https://covers.openlibrary.org/b/id/8184999-M.jpg" },
      { "title": "Cinder", "img": "https://covers.openlibrary.org/b/id/6998634-M.jpg" },
      { "title": "The Outsiders", "img": "https://covers.openlibrary.org/b/id/7263662-M.jpg" },
      { "title": "The First Adventure", "img": "https://covers.openlibrary.org/b/id/409304-M.jpg" },
      { "title": "A Series of Unfortunate Events", "img": "https://images.unsplash.com/photo-1544716278-e513176f20b5?w=150&q=80" },
      { "title": "The Graveyard Book", "img": "https://covers.openlibrary.org/b/id/7099583-M.jpg" },
      { "title": "Bridge to Terabithia", "img": "https://covers.openlibrary.org/b/id/12627341-M.jpg" },
      { "title": "Out of My Mind", "img": "https://covers.openlibrary.org/b/id/8803535-M.jpg" },
      { "title": "Shadow and Bone", "img": "https://covers.openlibrary.org/b/id/13816048-M.jpg" },
      { "title": "The Lightning Queen", "img": "https://covers.openlibrary.org/b/id/7393350-M.jpg" },
      { "title": "Throne of glass", "img": "https://covers.openlibrary.org/b/id/13312488-M.jpg" }
    ];

    const bookContainer = document.getElementById('book-schedule-container');
    const audio = document.getElementById('page-turn-audio');
    if (bookContainer) {
      masterBookList.forEach((book, index) => {
        const div = document.createElement('div');
        div.className = 'book-item';
        div.style.cssText = 'text-align: center; background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: transform 0.2s; position: relative;';
        
        let readBadge = book.read ? `<div style="position: absolute; top: 0; right: 0; background: #4ade80; color: #111; font-weight: bold; padding: 2px 5px; font-size: 0.6rem; border-radius: 0 8px 0 8px; z-index: 2;">✅ READ</div>` : '';
        
        div.innerHTML = `
          ${readBadge}
          <div style="font-size: 0.7rem; color: #a855f7; font-weight: bold; margin-bottom: 2px;">Book ${index + 1}</div>
          <img src="${book.img}" alt="${book.title}" style="width: 100%; aspect-ratio: 2/3; object-fit: cover; border-radius: 4px; margin-bottom: 0.5rem; pointer-events: none; opacity: ${book.read ? '0.6' : '1'}">
          <p style="font-size: 0.8rem; font-weight: bold; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; pointer-events: none; color: ${book.read ? '#aaa' : '#fff'};">${book.title}</p>
        `;
        div.addEventListener('mouseenter', () => {
          audio.currentTime = 0;
          audio.volume = 0.2;
          audio.play().catch(e => {});
        });
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
          if(!document.getElementById('profile-pet')) {
            const petEl = document.createElement('div');
            petEl.id = 'profile-pet';
            petEl.style.cssText = 'position:absolute; top:-15px; right:-15px; font-size:1.5rem; animation: float 3s ease-in-out infinite; pointer-events:none; z-index:100;';
            document.getElementById('drag0n-profile-widget').appendChild(petEl);
          }
          document.getElementById('profile-pet').innerText = pet;
        }

        let borderStyle = purchases.avatarBorder === 'fire' ? 'border: 2px solid #ef4444; box-shadow: 0 0 10px #ef4444;' : '';
        let aHtml = a.startsWith('data:') ? `<img src="${a}" style="width:24px;height:24px;border-radius:50%;vertical-align:middle; ${borderStyle}">` : `<span style="${borderStyle} border-radius:50%; padding:2px;">${a}</span>`;
        
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
          registerModal.style.display = 'flex';
        } else {
          alert('You are already registered as ' + localStorage.getItem('drag0n_user') + '!');
        }
      });
    }

    if(document.getElementById('close-register-btn')) {
      document.getElementById('close-register-btn').addEventListener('click', () => {
        registerModal.style.display = 'none';
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
                errorEl.textContent = "Username is already taken!"; errorEl.style.display = 'block';
                createBtn.disabled = false; createBtn.textContent = "Enter Website";
              } else {
                await userRef.set({ username: username, avatar: selectedAvatar, created_at: Date.now() });
                localStorage.setItem('drag0n_user', username);
                localStorage.setItem('drag0n_avatar', selectedAvatar);
                registerModal.style.display = 'none';
                updateProfileWidget();
                
                // If they created an account from index page after lock
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
      if(localStorage.getItem('drag0n_owner') === 'true') return; // owner doesn't level
      if(!localStorage.getItem('drag0n_user')) return; // unregistered doesn't level
      let currentXp = parseInt(localStorage.getItem('drag0n_xp') || '0');
      let oldLvl = Math.floor(Math.sqrt(currentXp / 100)) + 1;
      
      currentXp += amount;
      localStorage.setItem('drag0n_xp', currentXp);
      
      let dcEarned = Math.floor(amount / 5);
      if(dcEarned > 0) {
        let currentDC = parseInt(localStorage.getItem('drag0n_dc') || '0');
        currentDC += dcEarned;
        localStorage.setItem('drag0n_dc', currentDC);
      }
      
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
    
    // Give daily login XP (50)
    window.addEventListener('load', () => {
      const today = new Date().toISOString().split('T')[0];
      if(localStorage.getItem('drag0n_last_login') !== today) {
        localStorage.setItem('drag0n_last_login', today);
        setTimeout(() => window.addXP(50), 2000);
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

    // LOFI PLAYER
    const lofiAudio = document.getElementById('lofi-audio');
    const lofiBtn = document.getElementById('lofi-play');
    if(lofiBtn && lofiAudio) {
      // Remember state
      if(sessionStorage.getItem('lofi_playing') === 'true') {
        lofiAudio.play().catch(()=>{});
        lofiBtn.textContent = 'Pause';
      }
      lofiBtn.addEventListener('click', () => {
        if(lofiAudio.paused) {
          lofiAudio.play();
          lofiBtn.textContent = 'Pause';
          sessionStorage.setItem('lofi_playing', 'true');
        } else {
          lofiAudio.pause();
          lofiBtn.textContent = 'Play';
          sessionStorage.setItem('lofi_playing', 'false');
        }
      });
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

    // EASTER EGG HUNT
    window.findEgg = function(eggId, element) {
      element.style.display = 'none';
      let found = JSON.parse(localStorage.getItem('drag0n_eggs') || '[]');
      if(!found.includes(eggId)) {
        found.push(eggId);
        localStorage.setItem('drag0n_eggs', JSON.stringify(found));
        alert(`You found a secret token! (${found.length}/5)`);
        if(window.addXP) window.addXP(100);
        
        if(found.length === 5) {
          alert('YOU FOUND ALL 5 TOKENS! YOU UNLOCKED THE GOLDEN DRAGON AVATAR!');
          localStorage.setItem('drag0n_avatar', '🐲');
          if(typeof firebase !== 'undefined' && localStorage.getItem('drag0n_user')) {
             firebase.database().ref('users/' + localStorage.getItem('drag0n_user').toLowerCase() + '/avatar').set('🐲');
          }
          updateProfileWidget();
        }
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
