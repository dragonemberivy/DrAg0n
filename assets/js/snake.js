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
    // Cyberpunk Canvas Background Grid
    ctx.fillStyle = '#0b0e17';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Glowing Neon Food Target
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ec4899';
    const fGrad = ctx.createRadialGradient(food.x + gridSize/2, food.y + gridSize/2, 2, food.x + gridSize/2, food.y + gridSize/2, gridSize/2);
    fGrad.addColorStop(0, '#f472b6');
    fGrad.addColorStop(1, '#db2777');
    ctx.fillStyle = fGrad;
    ctx.beginPath();
    ctx.arc(food.x + gridSize/2, food.y + gridSize/2, (gridSize/2) - 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Snake Body with Glowing Rounded Scales & Head Eyes
    snake.forEach((segment, i) => {
      ctx.save();
      if (i === 0) {
        // Head
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#38bdf8';
        const hGrad = ctx.createRadialGradient(segment.x + gridSize/2, segment.y + gridSize/2, 2, segment.x + gridSize/2, segment.y + gridSize/2, gridSize/2);
        hGrad.addColorStop(0, '#7dd3fc');
        hGrad.addColorStop(1, '#0284c7');
        ctx.fillStyle = hGrad;
        ctx.beginPath();
        ctx.arc(segment.x + gridSize/2, segment.y + gridSize/2, (gridSize/2), 0, Math.PI * 2);
        ctx.fill();

        // Glowing Snake Eyes
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(segment.x + 4, segment.y + 4, 2, 0, Math.PI * 2);
        ctx.arc(segment.x + 11, segment.y + 4, 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Body Segments
        const sGrad = ctx.createRadialGradient(segment.x + gridSize/2, segment.y + gridSize/2, 1, segment.x + gridSize/2, segment.y + gridSize/2, gridSize/2);
        sGrad.addColorStop(0, '#a5b4fc');
        sGrad.addColorStop(1, '#4f46e5');
        ctx.fillStyle = sGrad;
        ctx.beginPath();
        ctx.arc(segment.x + gridSize/2, segment.y + gridSize/2, (gridSize/2) - 1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
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
