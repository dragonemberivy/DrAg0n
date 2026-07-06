import re

with open("games.html", "r") as f:
    games_html = f.read()

flappy_html = """
      <div class="glass-card" style="border-color: rgba(14, 165, 233, 0.4);">
        <h3 style="color: #0ea5e9;">🐉 Flappy Dragon</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Fly high and earn XP!</p>
        <div id="flappy-game-container" style="margin-top: 10px; display:flex; justify-content:center;"></div>
      </div>
"""

if "flappy-game-container" not in games_html:
    games_html = games_html.replace('<div class="games-grid">', '<div class="games-grid">\n' + flappy_html)
    games_html = games_html.replace('<script src="assets/js/snake.js"></script>', '<script src="assets/js/snake.js"></script>\n  <script src="assets/js/flappy.js"></script>')
    with open("games.html", "w") as f:
        f.write(games_html)

