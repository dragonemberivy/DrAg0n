// --- LOVELY SCREEN COMPANIONS (Cursor Cat Style) ---

(function() {
  // Inject Companion Styles
  const style = document.createElement('style');
  style.innerHTML = `
    /* Floating Control Widget */
    #companion-widget {
      position: fixed;
      bottom: 20px;
      left: 20px;
      z-index: 100002;
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1.5rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4), 0 0 10px rgba(168, 85, 247, 0.2);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    #companion-widget:hover {
      transform: scale(1.1) rotate(15deg);
      border-color: #a855f7;
      box-shadow: 0 4px 25px rgba(168, 85, 247, 0.5);
    }
    
    /* Panel */
    #companion-panel {
      position: fixed;
      bottom: 80px;
      left: 20px;
      z-index: 100002;
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      width: 280px;
      border-radius: 16px;
      padding: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      display: none;
      flex-direction: column;
      gap: 10px;
      color: white;
      font-family: 'Outfit', sans-serif;
      animation: panelFadeIn 0.3s ease;
    }
    @keyframes panelFadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .companion-option {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.2s;
    }
    .companion-option:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(168, 85, 247, 0.4);
    }
    .companion-option.active {
      background: rgba(168, 85, 247, 0.15);
      border-color: #a855f7;
    }
    .option-icon {
      font-size: 1.8rem;
    }
    .option-info h4 {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 600;
    }
    .option-info p {
      margin: 0;
      font-size: 0.75rem;
      color: #94a3b8;
    }

    /* Screen Companion container */
    .pet-container {
      position: fixed;
      pointer-events: none;
      z-index: 100001;
      width: 48px;
      height: 48px;
      transform-origin: bottom center;
      transition: transform 0.1s ease;
    }

    /* Animations */
    @keyframes tail-wag {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(18deg); }
    }
    @keyframes paw-walk {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    @keyframes wing-flutter {
      0%, 100% { transform: scaleX(1); }
      50% { transform: scaleX(0.4); }
    }
    @keyframes head-bob {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(2px); }
    }
    @keyframes sleep-pulse {
      0%, 100% { transform: scale(0.95); opacity: 0.8; }
      50% { transform: scale(1.05); opacity: 1; }
    }

    /* State Bindings */
    .pet-tail {
      transform-origin: 46px 42px;
      animation: tail-wag 0.8s infinite ease-in-out;
    }
    .pet-tail-dragon {
      transform-origin: 45px 42px;
      animation: tail-wag 0.6s infinite ease-in-out;
    }
    .pet-tail-cyber {
      transform-origin: 46px 36px;
      animation: tail-wag 0.4s infinite linear;
    }
    
    .walking .paw-fl {
      animation: paw-walk 0.4s infinite ease-in-out;
    }
    .walking .paw-fr {
      animation: paw-walk 0.4s infinite ease-in-out 0.2s;
    }
    .running .paw-fl {
      animation: paw-walk 0.2s infinite ease-in-out;
    }
    .running .paw-fr {
      animation: paw-walk 0.2s infinite ease-in-out 0.1s;
    }

    .walking .wing-left {
      transform-origin: 22px 28px;
      animation: wing-flutter 0.3s infinite ease-in-out;
    }
    .walking .wing-right {
      transform-origin: 42px 28px;
      animation: wing-flutter 0.3s infinite ease-in-out 0.15s;
    }
    .running .wing-left {
      transform-origin: 22px 28px;
      animation: wing-flutter 0.15s infinite ease-in-out;
    }
    .running .wing-right {
      transform-origin: 42px 28px;
      animation: wing-flutter 0.15s infinite ease-in-out 0.08s;
    }

    .idle .pet-head {
      animation: head-bob 1.5s infinite ease-in-out;
    }

    /* Zzz Emits */
    .sleep-particle {
      position: fixed;
      color: #38bdf8;
      font-size: 0.8rem;
      pointer-events: none;
      z-index: 100000;
      font-weight: bold;
      animation: sleepFloat 2s linear forwards;
    }
    @keyframes sleepFloat {
      0% { opacity: 0; transform: translate(0, 0) scale(0.5); }
      10% { opacity: 1; }
      100% { opacity: 0; transform: translate(15px, -40px) scale(1.2); }
    }

    /* Fire Emits */
    .fire-particle {
      position: fixed;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #f43f5e;
      box-shadow: 0 0 8px #f43f5e, 0 0 12px #fb7185;
      pointer-events: none;
      z-index: 100000;
      animation: fireFloat 1s cubic-bezier(0.25, 1, 0.5, 1) forwards;
    }
    @keyframes fireFloat {
      0% { opacity: 1; transform: translate(0, 0) scale(1); }
      100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(0.2); }
    }
  `;
  document.head.appendChild(style);

  // Setup DOM Elements
  const widget = document.createElement('div');
  widget.id = 'companion-widget';
  widget.innerHTML = '🐾';
  widget.title = 'Screen Companion Selector';
  document.body.appendChild(widget);

  const panel = document.createElement('div');
  panel.id = 'companion-panel';
  panel.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">
      <h3 style="margin:0; font-size:1.1rem; font-weight:800; color:#fbbf24;">Screen Mascots</h3>
      <span id="close-companion-panel" style="cursor:pointer; opacity:0.6; font-size:1.2rem;">&times;</span>
    </div>
    <div class="companion-option" data-pet="cat">
      <span class="option-icon">🐱</span>
      <div class="option-info">
        <h4>Neko the Cat</h4>
        <p>A cute calico cat who chases your cursor.</p>
      </div>
    </div>
    <div class="companion-option" data-pet="dragon">
      <span class="option-icon">🐉</span>
      <div class="option-info">
        <h4>Ignis the Dragon</h4>
        <p>Breathes tiny sparks when clicking!</p>
      </div>
    </div>
    <div class="companion-option" data-pet="cyber_puppy">
      <span class="option-icon">🐶</span>
      <div class="option-info">
        <h4>Sparky the Puppy</h4>
        <p>A neon dog with a glowing visor.</p>
      </div>
    </div>
    <button id="dismiss-pet" style="width:100%; padding:8px; background:rgba(239, 68, 68, 0.15); border:1px solid #ef4444; border-radius:8px; color:#f87171; font-weight:600; font-size:0.85rem; cursor:pointer; margin-top:5px;">Send Pet Home</button>
  `;
  document.body.appendChild(panel);

  // Toggle Panel
  widget.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
    updateActiveOptionHighlight();
  });
  document.getElementById('close-companion-panel').addEventListener('click', (e) => {
    e.stopPropagation();
    panel.style.display = 'none';
  });
  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && e.target !== widget) {
      panel.style.display = 'none';
    }
  });

  // Pet selection
  const options = panel.querySelectorAll('.companion-option');
  options.forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const petType = opt.getAttribute('data-pet');
      localStorage.setItem('activeCompanion', petType);
      spawnPet(petType);
      updateActiveOptionHighlight();
      panel.style.display = 'none';
    });
  });

  document.getElementById('dismiss-pet').addEventListener('click', (e) => {
    e.stopPropagation();
    localStorage.removeItem('activeCompanion');
    despawnPet();
    updateActiveOptionHighlight();
    panel.style.display = 'none';
  });

  function updateActiveOptionHighlight() {
    const active = localStorage.getItem('activeCompanion');
    options.forEach(opt => {
      if (opt.getAttribute('data-pet') === active) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });
  }

  // Pet Kinematics & States
  let petX = window.innerWidth / 2;
  let petY = window.innerHeight / 2;
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let isIdle = true;
  let idleTimer = 0;

  // Mouse Listener
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    isIdle = false;
    idleTimer = 0;
  });

  function spawnPet(type) {
    despawnPet();
    const container = document.createElement('div');
    container.id = 'screen-companion';
    container.className = 'pet-container idle';
    container.style.left = `${petX}px`;
    container.style.top = `${petY}px`;

    // Inline SVGs for lightweight custom high-res rendering!
    let svgContent = '';
    if (type === 'cat') {
      svgContent = `
        <svg class="pet-svg" viewBox="0 0 64 64" width="48" height="48" style="overflow: visible;">
          <ellipse cx="32" cy="38" rx="16" ry="12" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
          <path d="M22 34 Q18 36 22 38" fill="#fda4af" opacity="0.6"/>
          <path d="M42 34 Q46 36 42 38" fill="#fda4af" opacity="0.6"/>
          <circle class="pet-head" cx="32" cy="22" r="10" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
          <polygon points="23,15 27,9 31,15" fill="#fda4af" stroke="#475569" stroke-width="2"/>
          <polygon points="41,15 37,9 33,15" fill="#fda4af" stroke="#475569" stroke-width="2"/>
          <circle cx="28" cy="21" r="1.5" fill="#0f172a"/>
          <circle cx="36" cy="21" r="1.5" fill="#0f172a"/>
          <path d="M31 24 Q32 25 33 24" stroke="#475569" stroke-width="1.5" fill="none"/>
          <path class="pet-tail" d="M46 42 Q54 36 50 26" stroke="#475569" stroke-width="3" fill="none" stroke-linecap="round"/>
          <circle class="pet-paw paw-fl" cx="24" cy="50" r="3.5" fill="#e2e8f0" stroke="#475569" stroke-width="2"/>
          <circle class="pet-paw paw-fr" cx="40" cy="50" r="3.5" fill="#e2e8f0" stroke="#475569" stroke-width="2"/>
        </svg>
      `;
    } else if (type === 'dragon') {
      svgContent = `
        <svg class="pet-svg" viewBox="0 0 64 64" width="48" height="48" style="overflow: visible;">
          <path class="pet-wing wing-left" d="M22 28 Q10 16 18 10 Q24 18 22 28" fill="#d946ef" stroke="#701a75" stroke-width="1.5" opacity="0.9"/>
          <path class="pet-wing wing-right" d="M42 28 Q54 16 46 10 Q40 18 42 28" fill="#d946ef" stroke="#701a75" stroke-width="1.5" opacity="0.9"/>
          <ellipse cx="32" cy="38" rx="15" ry="12" fill="#a855f7" stroke="#3b0764" stroke-width="2"/>
          <circle class="pet-head" cx="32" cy="22" r="10" fill="#a855f7" stroke="#3b0764" stroke-width="2"/>
          <path d="M25 15 L20 6 L27 13" fill="#facc15" stroke="#3b0764" stroke-width="1.5"/>
          <path d="M39 15 L44 6 L37 13" fill="#facc15" stroke="#3b0764" stroke-width="1.5"/>
          <circle cx="28" cy="21" r="1.5" fill="#facc15"/>
          <circle cx="36" cy="21" r="1.5" fill="#facc15"/>
          <path class="pet-tail-dragon" d="M45 42 Q52 48 58 42" stroke="#a855f7" stroke-width="4" fill="none" stroke-linecap="round"/>
          <circle class="pet-paw paw-fl" cx="24" cy="50" r="3.5" fill="#7e22ce" stroke="#3b0764" stroke-width="2"/>
          <circle class="pet-paw paw-fr" cx="40" cy="50" r="3.5" fill="#7e22ce" stroke="#3b0764" stroke-width="2"/>
        </svg>
      `;
    } else if (type === 'cyber_puppy') {
      svgContent = `
        <svg class="pet-svg" viewBox="0 0 64 64" width="48" height="48" style="overflow: visible;">
          <rect x="18" y="28" width="28" height="18" rx="4" fill="#06b6d4" stroke="#083344" stroke-width="2"/>
          <rect class="pet-head" x="22" y="14" width="20" height="16" rx="3" fill="#06b6d4" stroke="#083344" stroke-width="2"/>
          <rect x="24" y="18" width="16" height="5" rx="1" fill="#ec4899" filter="drop-shadow(0 0 4px #ec4899)"/>
          <rect class="pet-ear-left" x="18" y="10" width="4" height="10" rx="1" fill="#0891b2"/>
          <rect class="pet-ear-right" x="42" y="10" width="4" height="10" rx="1" fill="#0891b2"/>
          <line class="pet-tail-cyber" x1="46" y1="36" x2="56" y2="28" stroke="#0891b2" stroke-width="3" stroke-linecap="round"/>
          <rect class="pet-paw paw-fl" x="22" y="46" width="6" height="6" rx="1.5" fill="#22d3ee" stroke="#083344" stroke-width="2"/>
          <rect class="pet-paw paw-fr" x="36" y="46" width="6" height="6" rx="1.5" fill="#22d3ee" stroke="#083344" stroke-width="2"/>
        </svg>
      `;
    }

    container.innerHTML = svgContent;
    document.body.appendChild(container);
  }

  function despawnPet() {
    const existing = document.getElementById('screen-companion');
    if (existing) existing.remove();
  }

  // Fire Particle Emitter for Dragon click
  document.addEventListener('mousedown', (e) => {
    const active = localStorage.getItem('activeCompanion');
    if (active === 'dragon') {
      for (let i = 0; i < 8; i++) {
        createFireParticle(petX + 24, petY + 15);
      }
    }
  });

  function createFireParticle(x, y) {
    const p = document.createElement('div');
    p.className = 'fire-particle';
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    
    // Random directions
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 60 + 20;
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed;
    p.style.setProperty('--dx', `${dx}px`);
    p.style.setProperty('--dy', `${dy}px`);
    
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1000);
  }

  // Zzz Particle Emitter for sleep state
  function emitZzz() {
    const active = localStorage.getItem('activeCompanion');
    if (!active || !isIdle || idleTimer < 180) return; // 3 seconds of absolute idle
    
    const z = document.createElement('div');
    z.className = 'sleep-particle';
    z.innerText = 'Z';
    z.style.left = `${petX + 35}px`;
    z.style.top = `${petY + 5}px`;
    
    document.body.appendChild(z);
    setTimeout(() => z.remove(), 2000);
  }

  setInterval(emitZzz, 1200);

  // Main Loop
  function tick() {
    const petEl = document.getElementById('screen-companion');
    const active = localStorage.getItem('activeCompanion');

    if (!active) {
      despawnPet();
      return requestAnimationFrame(tick);
    }

    if (!petEl) {
      spawnPet(active);
      return requestAnimationFrame(tick);
    }

    // Kinematics: Chasing the mouse
    // Target position is offset slightly below the cursor
    const targetX = mouseX - 24;
    const targetY = mouseY - 40;

    const dx = targetX - petX;
    const dy = targetY - petY;
    const dist = Math.hypot(dx, dy);

    idleTimer++;

    if (dist > 8) {
      isIdle = false;
      
      // Speed adjustments
      let speedFactor = 0.08;
      if (dist > 250) {
        speedFactor = 0.12; // Run fast
      }
      
      petX += dx * speedFactor;
      petY += dy * speedFactor;
      
      petEl.style.left = `${petX}px`;
      petEl.style.top = `${petY}px`;

      // Flip orientation based on horizontal drift
      if (dx > 2) {
        petEl.style.transform = 'scaleX(1)';
      } else if (dx < -2) {
        petEl.style.transform = 'scaleX(-1)';
      }

      // Toggle state class names for walking/running
      if (dist > 150) {
        petEl.className = 'pet-container walking running';
      } else {
        petEl.className = 'pet-container walking';
      }
    } else {
      isIdle = true;
      petEl.className = 'pet-container idle';
      
      // Face cursor even when standing still
      if (mouseX > petX + 24) {
        petEl.style.transform = 'scaleX(1)';
      } else {
        petEl.style.transform = 'scaleX(-1)';
      }
    }

    requestAnimationFrame(tick);
  }

  // Start Loop on Page Load
  requestAnimationFrame(tick);

  // Initial highlight check
  setTimeout(updateActiveOptionHighlight, 100);
})();
