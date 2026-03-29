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
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
      databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_PROJECT_ID.appspot.com",
      messagingSenderId: "YOUR_SENDER_ID",
      appId: "YOUR_APP_ID"
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

