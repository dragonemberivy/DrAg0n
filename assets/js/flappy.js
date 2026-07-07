const flappyContainer = document.getElementById('flappy-game-container');
if (flappyContainer) {
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 400;
  canvas.style.backgroundColor = '#71c5cf'; // Sky blue
  canvas.style.borderRadius = '8px';
  canvas.style.cursor = 'pointer';
  flappyContainer.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  
  let frames = 0;
  let state = { current: 0, getReady: 0, game: 1, over: 2 };
  let score = 0;
  
  const dragon = {
    x: 50, y: 150, w: 34, h: 26,
    radius: 12, speed: 0, gravity: 0.25, jump: 4.6, rotation: 0,
    draw: function() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🐉', 0, 0); // Flappy Dragon!
      ctx.restore();
    },
    update: function() {
      if (state.current === state.getReady) {
        this.y = 150 + Math.cos(frames / 10) * 5;
      } else {
        this.speed += this.gravity;
        this.y += this.speed;
        
        if (this.y + this.h/2 >= canvas.height - 112) {
          this.y = canvas.height - 112 - this.h/2;
          if (state.current === state.game) {
            state.current = state.over;
            submitFlappyScore(score);
          }
        }
        
        if (this.speed >= this.jump) {
          this.rotation = 90 * Math.PI / 180;
        } else {
          this.rotation = -25 * Math.PI / 180;
        }
      }
    },
    flap: function() { this.speed = -this.jump; }
  };
  
  const pipes = {
    position: [],
    w: 53, h: 400, gap: 85, dx: 2,
    draw: function() {
      for (let i = 0; i < this.position.length; i++) {
        let p = this.position[i];
        let topYPos = p.y;
        let bottomYPos = p.y + this.h + this.gap;
        
        ctx.fillStyle = '#73bf2e';
        ctx.strokeStyle = '#558022';
        ctx.lineWidth = 2;
        
        // Top pipe
        ctx.fillRect(p.x, topYPos, this.w, this.h);
        ctx.strokeRect(p.x, topYPos, this.w, this.h);
        
        // Bottom pipe
        ctx.fillRect(p.x, bottomYPos, this.w, this.h);
        ctx.strokeRect(p.x, bottomYPos, this.w, this.h);
      }
    },
    update: function() {
      if (state.current !== state.game) return;
      if (frames % 100 === 0) {
        this.position.push({ x: canvas.width, y: -200 * (Math.random() + 1) });
      }
      for (let i = 0; i < this.position.length; i++) {
        let p = this.position[i];
        let bottomPipeYPos = p.y + this.h + this.gap;
        
        // Collision detection
        if (dragon.x + dragon.radius > p.x && dragon.x - dragon.radius < p.x + this.w &&
           (dragon.y + dragon.radius > p.y && dragon.y - dragon.radius < p.y + this.h ||
            dragon.y + dragon.radius > bottomPipeYPos && dragon.y - dragon.radius < bottomPipeYPos + this.h)) {
            state.current = state.over;
            submitFlappyScore(score);
        }
        
        p.x -= this.dx;
        
        if (p.x + this.w <= 0) {
          this.position.shift();
          score += 1;
          if(window.addXP) window.addXP(5); // Instantly award XP/DC for passing a pipe
        }
      }
    },
    reset: function() { this.position = []; }
  };
  
  const bg = {
    draw: function() {
      ctx.fillStyle = '#ded895';
      ctx.fillRect(0, canvas.height - 112, canvas.width, 112); // Ground
    }
  }

  function draw() {
    ctx.fillStyle = '#71c5cf';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    bg.draw();
    pipes.draw();
    dragon.draw();
    
    if (state.current === state.getReady) {
      ctx.fillStyle = '#fff';
      ctx.font = '20px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText('Click to Flap!', canvas.width/2, canvas.height/2);
    }
    if (state.current === state.game || state.current === state.over) {
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.font = '35px Outfit';
      ctx.textAlign = 'center';
      ctx.strokeText(score, canvas.width/2, 50);
      ctx.fillText(score, canvas.width/2, 50);
    }
    if (state.current === state.over) {
      ctx.font = '20px Outfit';
      ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 20);
      ctx.fillText('Click to Restart', canvas.width/2, canvas.height/2 + 20);
    }
  }
  
  function update() {
    dragon.update();
    pipes.update();
  }
  
  function loop() {
    update();
    draw();
    frames++;
    requestAnimationFrame(loop);
  }
  
  canvas.addEventListener('click', function(e) {
    if (state.current === state.getReady) {
      state.current = state.game;
    } else if (state.current === state.game) {
      dragon.flap();
    } else if (state.current === state.over) {
      pipes.reset();
      dragon.speed = 0;
      dragon.rotation = 0;
      score = 0;
      state.current = state.getReady;
    }
  });

  function submitFlappyScore(s) {
    if(s > 0 && typeof firebase !== 'undefined' && localStorage.getItem('drag0n_user')) {
      const u = localStorage.getItem('drag0n_user');
      const a = localStorage.getItem('drag0n_avatar') || '🐉';
      const ref = firebase.database().ref('leaderboards/flappy/' + u.toLowerCase());
      ref.once('value').then(snap => {
        const existing = snap.val();
        if(!existing || s > existing.score) {
          ref.set({ username: u, avatar: a, score: s, timestamp: Date.now() });
        }
      });
    }
  }

  loop();
}
