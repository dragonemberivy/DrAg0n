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
    radius: 14, speed: 0, gravity: 0.25, jump: 4.6, rotation: 0,
    particles: [],
    draw: function() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);

      // Fire Thruster Trail
      if (state.current === state.game) {
        this.particles.push({ x: -14, y: Math.random()*6 - 3, r: Math.random()*5 + 3, opacity: 1, color: Math.random() < 0.5 ? '#ef4444' : '#fbbf24' });
      }
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x -= 2;
        p.opacity -= 0.08;
        if (p.opacity <= 0) {
          this.particles.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Realistic Metallic Dragon Body
      const wingFlap = Math.sin(frames * 0.2) * 8;
      
      // Wing (Back)
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.moveTo(-4, -2);
      ctx.lineTo(-18, -14 + wingFlap);
      ctx.lineTo(-2, -6);
      ctx.fill();

      // Body Gradient (Crimson to Ember)
      const bGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 16);
      bGrad.addColorStop(0, '#f87171');
      bGrad.addColorStop(0.6, '#dc2626');
      bGrad.addColorStop(1, '#7f1d1d');
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wing (Front)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(-2, 0);
      ctx.lineTo(-16, -16 - wingFlap);
      ctx.lineTo(4, -4);
      ctx.fill();

      // Glowing Eye
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(8, -4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(9, -4, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Snout & Fire Horn
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(12, -6);
      ctx.lineTo(18, -10);
      ctx.lineTo(14, -2);
      ctx.fill();

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
          this.rotation = 70 * Math.PI / 180;
        } else {
          this.rotation = -20 * Math.PI / 180;
        }
      }
    },
    flap: function() { this.speed = -this.jump; }
  };
  
  const pipes = {
    position: [],
    w: 53, h: 400, gap: 90, dx: 2,
    draw: function() {
      for (let i = 0; i < this.position.length; i++) {
        let p = this.position[i];
        let topYPos = p.y;
        let bottomYPos = p.y + this.h + this.gap;
        
        // Realistic Obsidian Volcanic Pillars
        const pillarGrad = ctx.createLinearGradient(p.x, 0, p.x + this.w, 0);
        pillarGrad.addColorStop(0, '#1e293b');
        pillarGrad.addColorStop(0.3, '#334155');
        pillarGrad.addColorStop(0.7, '#0f172a');
        pillarGrad.addColorStop(1, '#020617');

        ctx.fillStyle = pillarGrad;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        
        // Top Pipe
        ctx.fillRect(p.x, topYPos, this.w, this.h);
        ctx.strokeRect(p.x, topYPos, this.w, this.h);
        
        // Bottom Pipe
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
          if(window.addXP) window.addXP(5);
        }
      }
    },
    reset: function() { this.position = []; }
  };
  
  const bg = {
    draw: function() {
      // Twilight Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#0b0e17');
      skyGrad.addColorStop(0.6, '#1e1b4b');
      skyGrad.addColorStop(1, '#312e81');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Distant Floating Planet Silhouette
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.beginPath();
      ctx.arc(220, 80, 45, 0, Math.PI * 2);
      ctx.fill();

      // Terrain Ground
      const groundGrad = ctx.createLinearGradient(0, canvas.height - 112, 0, canvas.height);
      groundGrad.addColorStop(0, '#0f172a');
      groundGrad.addColorStop(1, '#020617');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, canvas.height - 112, canvas.width, 112);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.beginPath(); ctx.moveTo(0, canvas.height - 112); ctx.lineTo(canvas.width, canvas.height - 112); ctx.stroke();
    }
  }

  function draw() {
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
