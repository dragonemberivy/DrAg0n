import re
import os

# 1. Update games.html to add Snake game and Leaderboard UI
with open("games.html", "r") as f:
    games_html = f.read()

snake_html = """
      <div class="glass-card" style="border-color: rgba(236, 72, 153, 0.4);">
        <h3 style="color: #ec4899;">🐍 Neon Snake</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Classic Snake with a modern twist!</p>
        <div id="snake-game-container" style="margin-top: 1rem;"></div>
      </div>
"""
if "snake-game-container" not in games_html:
    games_html = games_html.replace('<div class="games-grid">', '<div class="games-grid">\n' + snake_html)
    
    # Add script tag
    games_html = games_html.replace('<script src="assets/js/main.js"></script>', '<script src="assets/js/main.js"></script>\n  <script src="assets/js/snake.js"></script>')
    
    with open("games.html", "w") as f:
        f.write(games_html)


# 2. Update main.js for Memory Game Leaderboard and Space Game Laser hook
with open("assets/js/main.js", "r") as f:
    main_js = f.read()

# Memory Game Leaderboard
memory_win_old = """
        document.getElementById('memory-matches').textContent = memCardsMatched;
        if (memCardsMatched === cardsArray.length / 2) {
          setTimeout(() => alert(`You won in ${memMoves} moves!`), 300);
        }
"""
memory_win_new = """
        document.getElementById('memory-matches').textContent = memCardsMatched;
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
"""
if "Firebase Leaderboard (fewest moves wins)" not in main_js:
    main_js = main_js.replace(memory_win_old, memory_win_new)
    
    with open("assets/js/main.js", "w") as f:
        f.write(main_js)

EOF
