document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('snake-game-container');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center;">
      <h3 style="margin-bottom: 5px;">Neon Snake</h3>
      <div style="display:flex; justify-content:space-between; width: 300px; margin: 0 auto 5px;">
        <span>Score: <span id="snake-score">0</span></span>
        <span>High: <span id="snake-high">0</span></span>
      </div>
      <canvas id="snake-canvas" width="300" height="300" style="background: rgba(0,0,0,0.5); border: 2px solid var(--accent); border-radius: 8px;"></canvas>
      <div style="margin-top: 10px;">
        <button id="snake-start">Start Game</button>
      </div>
    </div>
  `;

  const canvas = document.getElementById('snake-canvas');
  const ctx = canvas.getContext('2d');
  const gridSize = 15;
  let snake = [];
  let food = {};
  let dx = gridSize;
  let dy = 0;
  let score = 0;
  let highScore = localStorage.getItem('drag0n_snake_high') || 0;
  document.getElementById('snake-high').textContent = highScore;
  let gameLoop = null;

  function initGame() {
    snake = [{x: 150, y: 150}, {x: 135, y: 150}, {x: 120, y: 150}];
    dx = gridSize; dy = 0;
    score = 0;
    document.getElementById('snake-score').textContent = score;
    spawnFood();
    if(gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, 100);
  }

  function spawnFood() {
    food = {
      x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
      y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
    };
  }

  function update() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    // Wall collision
    if(head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
      return gameOver();
    }
    // Self collision
    for(let i=0; i<snake.length; i++) {
      if(head.x === snake[i].x && head.y === snake[i].y) return gameOver();
    }

    snake.unshift(head);

    if(head.x === food.x && head.y === food.y) {
      score += 10;
      document.getElementById('snake-score').textContent = score;
      if(window.addXP) window.addXP(2); // 2 XP per apple!
      spawnFood();
    } else {
      snake.pop();
    }
    draw();
  }

  function gameOver() {
    clearInterval(gameLoop);
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#ef4444';
    ctx.font = '24px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2);
    
    if(score > highScore) {
      highScore = score;
      localStorage.setItem('drag0n_snake_high', highScore);
      document.getElementById('snake-high').textContent = highScore;
      
      // FIREBASE LEADERBOARD
      if(typeof firebase !== 'undefined' && localStorage.getItem('drag0n_user')) {
        const u = localStorage.getItem('drag0n_user');
        const a = localStorage.getItem('drag0n_avatar') || '✨';
        firebase.database().ref('leaderboards/snake/' + u.toLowerCase()).set({
          username: u,
          avatar: a,
          score: highScore,
          timestamp: Date.now()
        });
      }
    }
  }

  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // Food
    ctx.fillStyle = '#ec4899';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ec4899';
    ctx.fillRect(food.x, food.y, gridSize-1, gridSize-1);
    
    // Snake
    ctx.shadowBlur = 0;
    snake.forEach((segment, i) => {
      ctx.fillStyle = i === 0 ? '#38bdf8' : '#818cf8';
      ctx.fillRect(segment.x, segment.y, gridSize-1, gridSize-1);
    });
  }

  document.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowUp' && dy === 0) { dx=0; dy=-gridSize; e.preventDefault(); }
    if(e.key === 'ArrowDown' && dy === 0) { dx=0; dy=gridSize; e.preventDefault(); }
    if(e.key === 'ArrowLeft' && dx === 0) { dx=-gridSize; dy=0; e.preventDefault(); }
    if(e.key === 'ArrowRight' && dx === 0) { dx=gridSize; dy=0; e.preventDefault(); }
  });

  document.getElementById('snake-start').addEventListener('click', initGame);
});
