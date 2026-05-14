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
    // 8. BOOK CLUB ADVANCED FEATURES
    // ------------------------------------
    
    // A. 30 Book Schedule Generator
    const masterBookList = [
      { title: "The Hunger Games", img: "https://images.unsplash.com/photo-1629196914275-f7e48b488ddc?w=150&q=80" },
      { title: "Percy Jackson", img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=150&q=80" },
      { title: "Harry Potter", img: "https://images.unsplash.com/photo-1618666012174-83b441c0bc76?w=150&q=80" },
      { title: "A Wrinkle in Time", img: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=150&q=80" },
      { title: "The Hobbit", img: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=150&q=80" },
      { title: "Ender's Game", img: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&q=80" },
      { title: "The Giver", img: "https://images.unsplash.com/photo-1518382410471-1258169f44fb?w=150&q=80" },
      { title: "Eragon", img: "https://images.unsplash.com/photo-1519077184716-11f44005b630?w=150&q=80" },
      { title: "The Golden Compass", img: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=150&q=80" },
      { title: "Divergent", img: "https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=150&q=80" },
      { title: "The Maze Runner", img: "https://images.unsplash.com/photo-1518605368461-1ee7c16503c1?w=150&q=80" },
      { title: "City of Bones", img: "https://images.unsplash.com/photo-1555562098-b8bc00962b1a?w=150&q=80" },
      { title: "Artemis Fowl", img: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=150&q=80" },
      { title: "Coraline", img: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=150&q=80" },
      { title: "Wonder", img: "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=150&q=80" },
      { title: "The Chronicles of Narnia", img: "https://images.unsplash.com/photo-1473221326025-9183b464bb7e?w=150&q=80" },
      { title: "Keeper of the Lost Cities", img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=150&q=80" },
      { title: "The Book Thief", img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=150&q=80" },
      { title: "Legend", img: "https://images.unsplash.com/photo-1524578971701-4470bcff05c2?w=150&q=80" },
      { title: "Scythe", img: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=150&q=80" },
      { title: "Cinder", img: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=150&q=80" },
      { title: "The Outsiders", img: "https://images.unsplash.com/photo-1544716278-e513176f20b5?w=150&q=80" },
      { title: "Holes", img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=150&q=80" },
      { title: "A Series of Unfortunate Events", img: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=150&q=80" },
      { title: "The Graveyard Book", img: "https://images.unsplash.com/photo-1478147427282-58a87a120781?w=150&q=80" },
      { title: "Bridge to Terabithia", img: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=150&q=80" },
      { title: "Out of My Mind", img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=150&q=80" },
      { title: "Shadow and Bone", img: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=150&q=80" },
      { title: "The Lightning Queen", img: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=150&q=80" },
      { title: "The Crossover", img: "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=150&q=80" }
    ];

    const bookContainer = document.getElementById('book-schedule-container');
    const audio = document.getElementById('page-turn-audio');
    if (bookContainer) {
      masterBookList.forEach((book, index) => {
        const div = document.createElement('div');
        div.className = 'book-item';
        div.style.cssText = 'text-align: center; background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: transform 0.2s;';
        div.innerHTML = `
          <div style="font-size: 0.7rem; color: #a855f7; font-weight: bold; margin-bottom: 2px;">Book ${index + 1}</div>
          <img src="${book.img}" alt="${book.title}" style="width: 100%; aspect-ratio: 2/3; object-fit: cover; border-radius: 4px; margin-bottom: 0.5rem; pointer-events: none;">
          <p style="font-size: 0.8rem; font-weight: bold; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; pointer-events: none;">${book.title}</p>
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

    // D. Firebase Reviews Integration
    let bookReviewsRef = null;
    const reviewsContainer = document.getElementById('reviews-container');
    
    try {
      bookReviewsRef = db.ref('book_club/reviews');
      // Clear static review
      if(reviewsContainer) reviewsContainer.innerHTML = '';
      
      bookReviewsRef.limitToLast(20).on('child_added', (snap) => {
        const review = snap.val();
        const div = document.createElement('div');
        div.style.cssText = 'background: rgba(0,0,0,0.2); padding: 0.8rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 0.5rem; animation: pulseGlow 1s ease-out;';
        div.innerHTML = `<strong style="color: #38bdf8;">${review.username}:</strong> ${review.text}`;
        // Add to top
        reviewsContainer.insertBefore(div, reviewsContainer.firstChild);
      });
    } catch(e) {
      console.warn("Firebase DB not fully available for Book Club.");
    }

    window.saveBookReview = function() {
      const usernameInput = document.getElementById('review-username');
      const textInput = document.getElementById('review-text');
      
      const username = usernameInput.value.trim() || 'Anonymous';
      const text = textInput.value.trim();
      
      if (!text) {
        alert('Please write some thoughts before saving!');
        return;
      }
      
      const escapedUsername = username.replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
      const escapedText = text.replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
      
      if (bookReviewsRef) {
        bookReviewsRef.push({
          username: escapedUsername,
          text: escapedText,
          timestamp: Date.now()
        });
      } else {
        // Fallback local
        const div = document.createElement('div');
        div.style.cssText = 'background: rgba(0,0,0,0.2); padding: 0.8rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 0.5rem;';
        div.innerHTML = `<strong style="color: #38bdf8;">${escapedUsername}:</strong> ${escapedText}`;
        reviewsContainer.insertBefore(div, reviewsContainer.firstChild);
      }
      
      textInput.value = '';
      usernameInput.value = '';
    };

