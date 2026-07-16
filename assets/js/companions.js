// --- OVERHAULED SCREEN COMPANIONS SYSTEM (10 Mascot Pets, 3 Biomes, 3 Interactive Toys) ---

(function() {
  // Inject Dynamic Styles
  const style = document.createElement('style');
  style.innerHTML = `
    /* Floating Widget Button */
    #companion-widget {
      position: fixed;
      bottom: 20px;
      left: 20px;
      z-index: 100002;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      width: 52px;
      height: 52px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1.6rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 15px rgba(168, 85, 247, 0.3);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    #companion-widget:hover {
      transform: scale(1.15) rotate(15deg);
      border-color: #a855f7;
      box-shadow: 0 8px 32px rgba(168, 85, 247, 0.6);
    }

    /* Tabbed glassmorphic panel */
    #companion-panel {
      position: fixed;
      bottom: 85px;
      left: 20px;
      z-index: 100002;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      width: 320px;
      border-radius: 20px;
      padding: 18px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
      display: none;
      flex-direction: column;
      color: white;
      font-family: 'Outfit', sans-serif;
      animation: panelFadeIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes panelFadeIn {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Tabs Headers */
    .panel-tabs {
      display: flex;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 8px;
      margin-bottom: 12px;
      gap: 5px;
    }
    .panel-tab {
      flex: 1;
      text-align: center;
      padding: 6px 0;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s;
      color: #94a3b8;
    }
    .panel-tab:hover {
      color: white;
      background: rgba(255, 255, 255, 0.05);
    }
    .panel-tab.active {
      color: white;
      background: rgba(168, 85, 247, 0.2);
      border: 1px solid rgba(168, 85, 247, 0.3);
    }

    /* Tab Contents scroll areas */
    .tab-content {
      display: none;
      max-height: 250px;
      overflow-y: auto;
      flex-direction: column;
      gap: 8px;
      padding-right: 4px;
    }
    .tab-content.active {
      display: flex;
    }
    
    /* Scrollbar */
    .tab-content::-webkit-scrollbar {
      width: 5px;
    }
    .tab-content::-webkit-scrollbar-track {
      background: transparent;
    }
    .tab-content::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
    }

    /* Selection Cards */
    .companion-card, .biome-card, .toy-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255,255,255,0.05);
      cursor: pointer;
      transition: all 0.2s;
    }
    .companion-card:hover, .biome-card:hover, .toy-card:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(168, 85, 247, 0.4);
      transform: translateY(-1px);
    }
    .companion-card.active, .biome-card.active, .toy-card.active {
      background: rgba(168, 85, 247, 0.15);
      border-color: #a855f7;
    }
    .card-icon {
      font-size: 1.8rem;
      filter: drop-shadow(0 0 5px rgba(255,255,255,0.1));
    }
    .card-info h4 {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 600;
    }
    .card-info p {
      margin: 0;
      font-size: 0.75rem;
      color: #94a3b8;
      line-height: 1.2;
    }

    /* Companion container */
    .pet-container {
      position: fixed;
      pointer-events: none;
      z-index: 100001;
      width: 48px;
      height: 48px;
      transform-origin: bottom center;
      transition: transform 0.1s ease, width 0.3s ease, height 0.3s ease;
    }

    /* Pet Kinematic animations */
    @keyframes tail-wag {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(18deg); }
    }
    @keyframes paw-walk {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    @keyframes wing-flutter {
      0%, 100% { transform: scaleY(1); }
      50% { transform: scaleY(0.4); }
    }
    @keyframes head-bob {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(2px); }
    }
    @keyframes pet-hop {
      0%, 100% { transform: translateY(0) scaleY(1); }
      40% { transform: translateY(-18px) scaleY(1.1); }
      75% { transform: translateY(0) scaleY(0.85); }
    }
    @keyframes slime-bounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.15, 0.8); }
    }
    @keyframes shark-swim {
      0%, 100% { transform: translateX(0) rotate(0); }
      50% { transform: translateX(-4px) rotate(2deg); }
    }

    /* CSS classes mapping to state variables */
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
    .pet-tail-shark {
      transform-origin: 12px 36px;
      animation: tail-wag 0.3s infinite ease-in-out;
    }
    .pet-tail-puff {
      transform-origin: 16px 42px;
      animation: tail-wag 1s infinite ease-in-out;
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

    .walking.pet-container-bunny, .running.pet-container-bunny {
      animation: pet-hop 0.6s infinite ease-in-out;
    }
    .walking.pet-container-frog, .running.pet-container-frog {
      animation: pet-hop 0.5s infinite ease-in-out;
    }
    .walking.pet-container-slime, .running.pet-container-slime {
      animation: slime-bounce 0.4s infinite ease-in-out;
    }
    .walking.pet-container-shark, .running.pet-container-shark {
      animation: shark-swim 0.4s infinite ease-in-out;
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

    /* Toy Elements */
    #pet-toy {
      position: fixed;
      z-index: 100000;
      width: 32px;
      height: 32px;
      cursor: grab;
      user-select: none;
      filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5));
      transition: transform 0.1s;
    }
    #pet-toy:active {
      cursor: grabbing;
      transform: scale(1.15);
    }
    .yarn-spin {
      animation: rollYarn 1.5s infinite linear;
    }
    @keyframes rollYarn {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Custom Laser cursor */
    .laser-active-cursor {
      cursor: crosshair !important;
    }
    #laser-pointer-dot {
      position: fixed;
      width: 14px;
      height: 14px;
      background: #ef4444;
      border-radius: 50%;
      pointer-events: none;
      z-index: 100003;
      box-shadow: 0 0 10px #ef4444, 0 0 20px #f87171, 0 0 30px #f87171;
      display: none;
    }

    /* Particles emitters */
    .sleep-particle {
      position: fixed;
      color: #38bdf8;
      font-size: 0.8rem;
      pointer-events: none;
      z-index: 100000;
      font-weight: bold;
      animation: sleepFloat 2.2s linear forwards;
    }
    @keyframes sleepFloat {
      0% { opacity: 0; transform: translate(0, 0) scale(0.5); }
      10% { opacity: 1; }
      100% { opacity: 0; transform: translate(15px, -45px) scale(1.3); }
    }

    .heart-particle {
      position: fixed;
      color: #f43f5e;
      font-size: 1.1rem;
      pointer-events: none;
      z-index: 100000;
      animation: heartFloat 1.5s ease-out forwards;
    }
    @keyframes heartFloat {
      0% { opacity: 1; transform: translate(0,0) scale(0.6); }
      100% { opacity: 0; transform: translate(var(--dx), -50px) scale(1.3); }
    }

    .rainbow-sparkle {
      position: fixed;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      pointer-events: none;
      z-index: 100000;
      animation: sparkFade 1s linear forwards;
    }
    @keyframes sparkFade {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(0.2); opacity: 0; }
    }

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

    /* Biome Background Overlays */
    .biome-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 1;
      overflow: hidden;
      display: none;
    }
    .biome-particle {
      position: absolute;
      pointer-events: none;
      animation: fallDown linear infinite;
    }
    @keyframes fallDown {
      0% { transform: translateY(-50px) rotate(0deg); opacity: 0; }
      10% { opacity: var(--max-op); }
      90% { opacity: var(--max-op); }
      100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  // Setup DOM Elements
  const widget = document.createElement('div');
  widget.id = 'companion-widget';
  widget.innerHTML = '🐾';
  widget.title = 'Screen Companion Control Panel';
  document.body.appendChild(widget);

  const panel = document.createElement('div');
  panel.id = 'companion-panel';
  panel.innerHTML = `
    <!-- Tabs Header -->
    <div class="panel-tabs">
      <div class="panel-tab active" data-tab="mascots">Mascots</div>
      <div class="panel-tab" data-tab="biomes">Biomes</div>
      <div class="panel-tab" data-tab="toys">Toys</div>
    </div>

    <!-- TAB 1: Mascots -->
    <div id="tab-mascots" class="tab-content active">
      <!-- 10 Mascot Pets -->
      <div class="companion-card" data-pet="cat">
        <span class="card-icon">🐱</span>
        <div class="card-info"><h4>Neko</h4><p>A cute calico cat chasing your cursor.</p></div>
      </div>
      <div class="companion-card" data-pet="dragon">
        <span class="card-icon">🐉</span>
        <div class="card-info"><h4>Ignis</h4><p>Emits neon fire sparks when clicking.</p></div>
      </div>
      <div class="companion-card" data-pet="cyber_puppy">
        <span class="card-icon">🐶</span>
        <div class="card-info"><h4>Sparky</h4><p>Neon cyber puppy with a pink visor.</p></div>
      </div>
      <div class="companion-card" data-pet="bunny">
        <span class="card-icon">🐰</span>
        <div class="card-info"><h4>Usagi</h4><p>Hops joyfully toward the cursor.</p></div>
      </div>
      <div class="companion-card" data-pet="frog">
        <span class="card-icon">🐸</span>
        <div class="card-info"><h4>Kero</h4><p>High jumping green frog companion.</p></div>
      </div>
      <div class="companion-card" data-pet="fox">
        <span class="card-icon">🦊</span>
        <div class="card-info"><h4>Kitsune</h4><p>Clever orange fox with fluffy tail.</p></div>
      </div>
      <div class="companion-card" data-pet="owl">
        <span class="card-icon">🦉</span>
        <div class="card-info"><h4>Hoot</h4><p>Flaps around your cursor gracefully.</p></div>
      </div>
      <div class="companion-card" data-pet="shark">
        <span class="card-icon">🦈</span>
        <div class="card-info"><h4>Fin</h4><p>Sky-shark gliding through screen space.</p></div>
      </div>
      <div class="companion-card" data-pet="unicorn">
        <span class="card-icon">🦄</span>
        <div class="card-info"><h4>Uni</h4><p>Leaves a trailing path of rainbow dust.</p></div>
      </div>
      <div class="companion-card" data-pet="slime">
        <span class="card-icon">👾</span>
        <div class="card-info"><h4>Gloop</h4><p>Squishy, glowing bouncy neon slime.</p></div>
      </div>
      
      <button id="dismiss-pet" style="width:100%; padding:9px; background:rgba(239, 68, 68, 0.1); border:1px solid rgba(239,68,68,0.4); border-radius:10px; color:#f87171; font-weight:600; font-size:0.85rem; cursor:pointer; margin-top:5px; transition: all 0.2s;">Send Mascot Home</button>
    </div>

    <!-- TAB 2: Biomes -->
    <div id="tab-biomes" class="tab-content">
      <div class="biome-card active" data-biome="none">
        <span class="card-icon">🏠</span>
        <div class="card-info"><h4>Standard Lobby</h4><p>Clean background layout.</p></div>
      </div>
      <div class="biome-card" data-biome="void">
        <span class="card-icon">🌌</span>
        <div class="card-info"><h4>Cosmic Void</h4><p>Drift through neon star clusters.</p></div>
      </div>
      <div class="biome-card" data-biome="forest">
        <span class="card-icon">🌳</span>
        <div class="card-info"><h4>Enchanted Forest</h4><p>Gentle falling leaves and glow.</p></div>
      </div>
      <div class="biome-card" data-biome="tundra">
        <span class="card-icon">❄️</span>
        <div class="card-info"><h4>Frozen Tundra</h4><p>A calm snowfall sweeps the screen.</p></div>
      </div>
    </div>

    <!-- TAB 3: Toys -->
    <div id="tab-toys" class="tab-content">
      <p style="margin: 0; font-size: 0.8rem; color: #94a3b8; text-align: center;">Pick a toy to drop on screen for your pet!</p>
      <div class="toy-card" data-toy="yarn">
        <span class="card-icon">🧶</span>
        <div class="card-info"><h4>Yarn Ball</h4><p>Pet will chase and play with the rolling ball.</p></div>
      </div>
      <div class="toy-card" data-toy="treat">
        <span class="card-icon">🍗</span>
        <div class="card-info"><h4>Gourmet Treat</h4><p>Pet eats it to grow in size and show hearts!</p></div>
      </div>
      <div class="toy-card" data-toy="laser">
        <span class="card-icon">⚡</span>
        <div class="card-info"><h4>Laser Pointer</h4><p>Cursor turns into red dot; pet chases at top speed.</p></div>
      </div>
      <button id="clear-toys" style="width:100%; padding:9px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:#cbd5e1; font-weight:600; font-size:0.85rem; cursor:pointer; margin-top:5px; transition: all 0.2s;">Clear Screen Toys</button>
    </div>
  `;
  document.body.appendChild(panel);

  // Biome elements in DOM
  const biomeOverlay = document.createElement('div');
  biomeOverlay.id = 'biome-overlay';
  biomeOverlay.className = 'biome-overlay';
  document.body.appendChild(biomeOverlay);

  // Laser Pointer Dot
  const laserDot = document.createElement('div');
  laserDot.id = 'laser-pointer-dot';
  document.body.appendChild(laserDot);

  // Toggle Panel
  widget.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
  });
  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && e.target !== widget && !e.target.closest('#pet-toy')) {
      panel.style.display = 'none';
    }
  });

  // Tab switching logic
  const tabs = panel.querySelectorAll('.panel-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.stopPropagation();
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const tabTarget = tab.getAttribute('data-tab');
      panel.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(`tab-${tabTarget}`).classList.add('active');
    });
  });

  // 1. MASCOTS selection
  const mascotCards = panel.querySelectorAll('.companion-card');
  mascotCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      const petType = card.getAttribute('data-pet');
      localStorage.setItem('activeCompanion', petType);
      spawnPet(petType);
      highlightActiveMascot();
      panel.style.display = 'none';
    });
  });

  document.getElementById('dismiss-pet').addEventListener('click', (e) => {
    e.stopPropagation();
    localStorage.removeItem('activeCompanion');
    despawnPet();
    highlightActiveMascot();
    panel.style.display = 'none';
  });

  function highlightActiveMascot() {
    const active = localStorage.getItem('activeCompanion');
    mascotCards.forEach(c => {
      if (c.getAttribute('data-pet') === active) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });
  }

  // 2. BIOMES selection
  const biomeCards = panel.querySelectorAll('.biome-card');
  biomeCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      const biomeType = card.getAttribute('data-biome');
      localStorage.setItem('activeBiome', biomeType);
      applyBiome(biomeType);
      highlightActiveBiome();
      panel.style.display = 'none';
    });
  });

  function highlightActiveBiome() {
    const active = localStorage.getItem('activeBiome') || 'none';
    biomeCards.forEach(c => {
      if (c.getAttribute('data-biome') === active) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });
  }

  // Particle engine loop for biomes
  let biomeInterval = null;
  function applyBiome(type) {
    if (biomeInterval) clearInterval(biomeInterval);
    biomeOverlay.innerHTML = '';
    biomeOverlay.style.display = type === 'none' ? 'none' : 'block';
    
    if (type === 'none') return;

    let particles = [];
    if (type === 'void') {
      particles = ['★', '✦', '☄', '⭐', '•'];
    } else if (type === 'forest') {
      particles = ['🍃', '🍂', '🍁', '✨'];
    } else if (type === 'tundra') {
      particles = ['❄', '❅', '❆', '✧'];
    }

    // Populate initial particles
    for (let i = 0; i < 15; i++) {
      createBiomeParticle(particles, true);
    }

    // Periodically spawn new ones
    biomeInterval = setInterval(() => {
      createBiomeParticle(particles, false);
    }, 700);
  }

  function createBiomeParticle(list, initial) {
    const symbol = list[Math.floor(Math.random() * list.length)];
    const p = document.createElement('div');
    p.className = 'biome-particle';
    p.innerText = symbol;

    // Styling properties
    const size = Math.random() * 1.5 + 0.8;
    const left = Math.random() * 100;
    const duration = Math.random() * 8 + 6;
    const opacity = Math.random() * 0.4 + 0.25;

    p.style.left = `${left}vw`;
    p.style.fontSize = `${size}rem`;
    p.style.animationDuration = `${duration}s`;
    p.style.setProperty('--max-op', opacity);
    
    if (initial) {
      // Offset vertically
      p.style.animationDelay = `-${Math.random() * duration}s`;
    }

    // Custom coloring based on biome
    const biome = localStorage.getItem('activeBiome');
    if (biome === 'void') {
      const colors = ['#a855f7', '#38bdf8', '#d946ef', '#f59e0b'];
      p.style.color = colors[Math.floor(Math.random() * colors.length)];
      p.style.textShadow = `0 0 8px ${p.style.color}`;
    } else if (biome === 'forest') {
      p.style.color = '#4ade80';
      p.style.textShadow = '0 0 6px #22c55e';
    } else if (biome === 'tundra') {
      p.style.color = '#e2e8f0';
      p.style.textShadow = '0 0 5px #ffffff';
    }

    biomeOverlay.appendChild(p);
    
    // Auto cleanup after anim duration
    setTimeout(() => p.remove(), duration * 1000);
  }

  // 3. TOYS selection
  const toyCards = panel.querySelectorAll('.toy-card');
  let activeToy = null; // 'yarn' | 'treat' | 'laser' | null
  let toyX = window.innerWidth / 2;
  let toyY = window.innerHeight / 2;

  toyCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      const toyType = card.getAttribute('data-toy');
      spawnToy(toyType);
      highlightActiveToy(toyType);
      panel.style.display = 'none';
    });
  });

  document.getElementById('clear-toys').addEventListener('click', (e) => {
    e.stopPropagation();
    removeToy();
    highlightActiveToy(null);
    panel.style.display = 'none';
  });

  function highlightActiveToy(type) {
    activeToy = type;
    toyCards.forEach(c => {
      if (c.getAttribute('data-toy') === type) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });

    // Handle Laser pointer styling
    if (type === 'laser') {
      document.body.classList.add('laser-active-cursor');
      laserDot.style.display = 'block';
    } else {
      document.body.classList.remove('laser-active-cursor');
      laserDot.style.display = 'none';
    }
  }

  function spawnToy(type) {
    removeToy();
    if (type === 'laser') return; // Handled separately

    const toy = document.createElement('div');
    toy.id = 'pet-toy';
    toy.style.left = `${window.innerWidth / 2 - 16}px`;
    toy.style.top = `${window.innerHeight / 2 - 16}px`;
    toyX = window.innerWidth / 2 - 16;
    toyY = window.innerHeight / 2 - 16;

    if (type === 'yarn') {
      toy.innerHTML = '<span style="font-size:2rem; display:block;" class="yarn-spin">🧶</span>';
    } else if (type === 'treat') {
      toy.innerHTML = '<span style="font-size:2rem; display:block;">🍗</span>';
    }

    // Drag-and-drop mechanics
    let isDragging = false;
    toy.addEventListener('mousedown', (e) => {
      isDragging = true;
      e.stopPropagation();
    });
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        toyX = e.clientX - 16;
        toyY = e.clientY - 16;
        toy.style.left = `${toyX}px`;
        toy.style.top = `${toyY}px`;
      }
    });
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    document.body.appendChild(toy);
  }

  function removeToy() {
    const existing = document.getElementById('pet-toy');
    if (existing) existing.remove();
    activeToy = null;
    document.body.classList.remove('laser-active-cursor');
    laserDot.style.display = 'none';
  }

  // Relocate toy anywhere on screen click (if clicking blank areas)
  document.addEventListener('mousedown', (e) => {
    if (activeToy && activeToy !== 'laser' && !panel.contains(e.target) && e.target !== widget && !e.target.closest('#pet-toy')) {
      const toy = document.getElementById('pet-toy');
      if (toy) {
        toyX = e.clientX - 16;
        toyY = e.clientY - 16;
        toy.style.left = `${toyX}px`;
        toy.style.top = `${toyY}px`;
      }
    }
  });

  // Track Laser pointer trailing dot
  document.addEventListener('mousemove', (e) => {
    if (activeToy === 'laser') {
      laserDot.style.left = `${e.clientX - 7}px`;
      laserDot.style.top = `${e.clientY - 7}px`;
    }
  });


  // Spawning screen companion
  let petX = window.innerWidth / 2;
  let petY = window.innerHeight / 2;
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let isIdle = true;
  let idleTimer = 0;
  let petSizeMultiplier = 1.0;
  let sizeResetTimeout = null;

  // Track cursor coordinates
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
    container.className = `pet-container pet-container-${type} idle`;
    container.style.left = `${petX}px`;
    container.style.top = `${petY}px`;
    container.style.transform = `scale(${petSizeMultiplier})`;

    // SVGs collection for 10 pets!
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
    } else if (type === 'bunny') {
      svgContent = `
        <svg class="pet-svg" viewBox="0 0 64 64" width="48" height="48" style="overflow: visible;">
          <ellipse cx="32" cy="40" rx="14" ry="10" fill="#f1f5f9" stroke="#475569" stroke-width="2"/>
          <circle class="pet-head" cx="32" cy="24" r="9" fill="#f1f5f9" stroke="#475569" stroke-width="2"/>
          <ellipse cx="28" cy="12" rx="3" ry="8" fill="#f1f5f9" stroke="#475569" stroke-width="2" transform="rotate(-10 28 12)"/>
          <ellipse cx="36" cy="12" rx="3" ry="8" fill="#f1f5f9" stroke="#475569" stroke-width="2" transform="rotate(10 36 12)"/>
          <ellipse cx="28" cy="12" rx="1.5" ry="5" fill="#fda4af" transform="rotate(-10 28 12)"/>
          <ellipse cx="36" cy="12" rx="1.5" ry="5" fill="#fda4af" transform="rotate(10 36 12)"/>
          <circle cx="29" cy="23" r="1.2" fill="#e11d48"/>
          <circle cx="35" cy="23" r="1.2" fill="#e11d48"/>
          <circle class="pet-tail-puff" cx="17" cy="43" r="4.5" fill="#f8fafc" stroke="#475569" stroke-width="1.5"/>
        </svg>
      `;
    } else if (type === 'frog') {
      svgContent = `
        <svg class="pet-svg" viewBox="0 0 64 64" width="48" height="48" style="overflow: visible;">
          <ellipse cx="32" cy="40" rx="16" ry="10" fill="#22c55e" stroke="#14532d" stroke-width="2"/>
          <circle cx="24" cy="30" r="5" fill="#22c55e" stroke="#14532d" stroke-width="2"/>
          <circle cx="40" cy="30" r="5" fill="#22c55e" stroke="#14532d" stroke-width="2"/>
          <circle cx="24" cy="30" r="2" fill="#000"/>
          <circle cx="40" cy="30" r="2" fill="#000"/>
          <path d="M26 40 Q32 44 38 40" stroke="#14532d" stroke-width="2" fill="none"/>
          <circle cx="20" cy="38" r="2" fill="#ef4444" opacity="0.6"/>
          <circle cx="44" cy="38" r="2" fill="#ef4444" opacity="0.6"/>
        </svg>
      `;
    } else if (type === 'fox') {
      svgContent = `
        <svg class="pet-svg" viewBox="0 0 64 64" width="48" height="48" style="overflow: visible;">
          <ellipse cx="32" cy="38" rx="15" ry="11" fill="#ea580c" stroke="#431407" stroke-width="2"/>
          <ellipse cx="32" cy="38" rx="10" ry="7" fill="#f8fafc"/>
          <polygon points="18,18 46,18 32,32" fill="#ea580c" stroke="#431407" stroke-width="2"/>
          <polygon points="22,18 42,18 32,28" fill="#f8fafc"/>
          <polygon points="18,18 14,8 24,14" fill="#ea580c" stroke="#431407" stroke-width="2"/>
          <polygon points="46,18 50,8 38,14" fill="#ea580c" stroke="#431407" stroke-width="2"/>
          <circle cx="32" cy="30" r="2" fill="#000"/>
          <path class="pet-tail" d="M46 42 Q58 48 52 30" stroke="#ea580c" stroke-width="6" fill="none" stroke-linecap="round"/>
          <path class="pet-tail-tip" d="M52 30 Q54 27 50 25" stroke="#f8fafc" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        </svg>
      `;
    } else if (type === 'owl') {
      svgContent = `
        <svg class="pet-svg" viewBox="0 0 64 64" width="48" height="48" style="overflow: visible;">
          <ellipse cx="32" cy="36" rx="15" ry="14" fill="#78350f" stroke="#451a03" stroke-width="2"/>
          <ellipse cx="32" cy="39" rx="10" ry="9" fill="#fef3c7"/>
          <path class="pet-wing wing-left" d="M18 32 Q10 24 16 42" stroke="#78350f" stroke-width="4.5" fill="none" stroke-linecap="round"/>
          <path class="pet-wing wing-right" d="M46 32 Q54 24 48 42" stroke="#78350f" stroke-width="4.5" fill="none" stroke-linecap="round"/>
          <circle class="pet-head" cx="25" cy="24" r="6.5" fill="#fef3c7" stroke="#451a03" stroke-width="1.5"/>
          <circle class="pet-head" cx="39" cy="24" r="6.5" fill="#fef3c7" stroke="#451a03" stroke-width="1.5"/>
          <circle cx="25" cy="24" r="2.5" fill="#000"/>
          <circle cx="39" cy="24" r="2.5" fill="#000"/>
          <polygon points="32,26 30,31 34,31" fill="#f59e0b" stroke="#451a03" stroke-width="1"/>
        </svg>
      `;
    } else if (type === 'shark') {
      svgContent = `
        <svg class="pet-svg" viewBox="0 0 64 64" width="48" height="48" style="overflow: visible;">
          <path d="M12 36 Q32 20 52 36 Q32 44 12 36" fill="#64748b" stroke="#1e293b" stroke-width="2"/>
          <path d="M16 36 Q32 42 48 36 Q32 36 16 36" fill="#f8fafc"/>
          <path d="M32 26 L38 12 L42 24 Z" fill="#64748b" stroke="#1e293b" stroke-width="2"/>
          <path class="pet-tail-shark" d="M12 36 L4 30 L6 42 Z" fill="#64748b" stroke="#1e293b" stroke-width="2"/>
          <circle cx="44" cy="32" r="1.5" fill="#000"/>
        </svg>
      `;
    } else if (type === 'unicorn') {
      svgContent = `
        <svg class="pet-svg" viewBox="0 0 64 64" width="48" height="48" style="overflow: visible;">
          <ellipse cx="28" cy="38" rx="14" ry="10" fill="#fdf2f8" stroke="#db2777" stroke-width="2"/>
          <ellipse class="pet-head" cx="42" cy="24" rx="8" ry="7" fill="#fdf2f8" stroke="#db2777" stroke-width="2" transform="rotate(-15 42 24)"/>
          <polygon points="46,18 56,6 48,15" fill="#facc15" stroke="#d97706" stroke-width="1.5"/>
          <path d="M36 18 Q32 28 36 34" stroke="#f472b6" stroke-width="3" fill="none"/>
          <path class="pet-tail" d="M14 38 Q6 34 10 46" stroke="#f472b6" stroke-width="3" fill="none" stroke-linecap="round"/>
          <circle cx="44" cy="22" r="1.5" fill="#db2777"/>
        </svg>
      `;
    } else if (type === 'slime') {
      svgContent = `
        <svg class="pet-svg" viewBox="0 0 64 64" width="48" height="48" style="overflow: visible;">
          <path d="M16 46 Q16 26 32 26 Q48 26 48 46 Q32 50 16 46 Z" fill="#22c55e" stroke="#15803d" stroke-width="2" opacity="0.95" filter="drop-shadow(0 0 4px #22c55e)"/>
          <circle cx="26" cy="38" r="2.5" fill="#15803d"/>
          <circle cx="38" cy="38" r="2.5" fill="#15803d"/>
          <path d="M30 42 Q32 44 34 42" stroke="#15803d" stroke-width="1.5" fill="none"/>
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

  // Emits rainbow sparkles for Unicorn
  function emitRainbow(x, y) {
    const p = document.createElement('div');
    p.className = 'rainbow-sparkle';
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    
    const colors = ['#f43f5e', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];
    p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    p.style.boxShadow = `0 0 6px ${p.style.backgroundColor}`;
    
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1000);
  }

  // Emits heart particles for eating treat
  function emitHeart(x, y) {
    const h = document.createElement('div');
    h.className = 'heart-particle';
    h.innerText = '❤️';
    h.style.left = `${x}px`;
    h.style.top = `${y}px`;
    h.style.setProperty('--dx', `${(Math.random() - 0.5) * 40}px`);
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 1500);
  }

  // Emits fire sparks for Dragon clicks
  function createFireParticle(x, y) {
    const p = document.createElement('div');
    p.className = 'fire-particle';
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 60 + 20;
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed;
    p.style.setProperty('--dx', `${dx}px`);
    p.style.setProperty('--dy', `${dy}px`);
    
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1000);
  }

  document.addEventListener('mousedown', (e) => {
    const active = localStorage.getItem('activeCompanion');
    if (active === 'dragon') {
      for (let i = 0; i < 8; i++) {
        createFireParticle(petX + 24, petY + 15);
      }
    }
  });

  // Emits Zzz sleeping particle
  function emitZzz() {
    const active = localStorage.getItem('activeCompanion');
    if (!active || !isIdle || idleTimer < 180) return;
    
    const z = document.createElement('div');
    z.className = 'sleep-particle';
    z.innerText = 'Z';
    z.style.left = `${petX + 35}px`;
    z.style.top = `${petY + 5}px`;
    
    document.body.appendChild(z);
    setTimeout(() => z.remove(), 2200);
  }

  setInterval(emitZzz, 1200);


  // Main Kinematic Motion Loop
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

    // Determine motion target:
    // If a toy is on the screen, the pet targets the toy!
    let targetX = mouseX - 24;
    let targetY = mouseY - 40;
    let chasingToy = false;

    if (activeToy && activeToy !== 'laser') {
      const toy = document.getElementById('pet-toy');
      if (toy) {
        targetX = toyX - 8;
        targetY = toyY - 12;
        chasingToy = true;
      }
    }

    const dx = targetX - petX;
    const dy = targetY - petY;
    const dist = Math.hypot(dx, dy);

    idleTimer++;

    // Standard chase speed
    let chaseSpeed = 0.08;

    // Laser pointer speed increase!
    if (activeToy === 'laser') {
      chaseSpeed = 0.18; // Pet goes wild!
    }

    if (dist > 8) {
      isIdle = false;
      
      // Scale speed up for running
      if (dist > 250) {
        chaseSpeed = activeToy === 'laser' ? 0.24 : 0.13;
      }
      
      petX += dx * chaseSpeed;
      petY += dy * chaseSpeed;
      
      petEl.style.left = `${petX}px`;
      petEl.style.top = `${petY}px`;

      // Orientation adjustment
      if (dx > 2) {
        petEl.style.transform = `scaleX(1) scale(${petSizeMultiplier})`;
      } else if (dx < -2) {
        petEl.style.transform = `scaleX(-1) scale(${petSizeMultiplier})`;
      }

      // Set moving states classes
      let baseClass = `pet-container pet-container-${active}`;
      if (dist > 150) {
        petEl.className = `${baseClass} walking running`;
      } else {
        petEl.className = `${baseClass} walking`;
      }

      // Rainbow trail effect for Unicorn
      if (active === 'unicorn' && Math.random() < 0.3) {
        emitRainbow(petX + 24, petY + 38);
      }
    } else {
      isIdle = true;
      petEl.className = `pet-container pet-container-${active} idle`;
      
      // Face cursor even when idle
      if (mouseX > petX + 24) {
        petEl.style.transform = `scaleX(1) scale(${petSizeMultiplier})`;
      } else {
        petEl.style.transform = `scaleX(-1) scale(${petSizeMultiplier})`;
      }

      // Toy actions upon collision
      if (chasingToy) {
        if (activeToy === 'treat') {
          // Play eating effect
          removeToy();
          highlightActiveToy(null);
          
          // Emit hearts and grow size!
          petSizeMultiplier = 1.5;
          petEl.style.transform = `${petEl.style.transform} scale(1.5)`;
          
          let heartCount = 0;
          const heartInterval = setInterval(() => {
            emitHeart(petX + 24, petY + 15);
            heartCount++;
            if (heartCount > 6) clearInterval(heartInterval);
          }, 200);

          // Reset size after 10 seconds
          if (sizeResetTimeout) clearTimeout(sizeResetTimeout);
          sizeResetTimeout = setTimeout(() => {
            petSizeMultiplier = 1.0;
          }, 10000);
        } else if (activeToy === 'yarn') {
          // Play rolling physics
          const toy = document.getElementById('pet-toy');
          if (toy) {
            // Roll the ball away slightly
            toyX += (Math.random() - 0.5) * 80;
            toyY += (Math.random() - 0.5) * 80;
            
            // Constrain within window
            toyX = Math.max(50, Math.min(window.innerWidth - 100, toyX));
            toyY = Math.max(50, Math.min(window.innerHeight - 100, toyY));
            
            toy.style.left = `${toyX}px`;
            toy.style.top = `${toyY}px`;
          }
        }
      }
    }

    requestAnimationFrame(tick);
  }

  // Initialization & Storage Reloads
  requestAnimationFrame(tick);

  setTimeout(() => {
    highlightActiveMascot();
    
    // Load biome
    const storedBiome = localStorage.getItem('activeBiome') || 'none';
    applyBiome(storedBiome);
    highlightActiveBiome();
  }, 100);
})();
