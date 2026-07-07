document.addEventListener('DOMContentLoaded', () => {
  const username = localStorage.getItem('drag0n_user') || 'Visitor';
  
  // Set the title
  document.getElementById('planet-name').textContent = `${username}'s Planet`;

  // Seeded Random Number Generator
  function cyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
  }

  function sfc32(a, b, c, d) {
    return function() {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
      var t = (a + b) | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      d = d + 1 | 0;
      t = t + d | 0;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    }
  }

  const seed = cyrb128(username);
  const rand = sfc32(seed[0], seed[1], seed[2], seed[3]);

  // Data arrays
  const sizes = [
    { label: "Dwarf Planet", mult: 0.6, gravs: ["Microgravity", "Very Low"] },
    { label: "Small Terrestrial", mult: 0.8, gravs: ["Low", "Normal"] },
    { label: "Earth-like", mult: 1.0, gravs: ["Normal"] },
    { label: "Super-Earth", mult: 1.2, gravs: ["High", "Very High"] },
    { label: "Gas Giant", mult: 1.6, gravs: ["Crushing"] }
  ];

  const creatures = [
    "Crystal Spiders", "Neon Slimes", "Floating Whales", "Magma Worms", 
    "Bioluminescent Fungi-Mice", "Void Rays", "Cyborg Beetles", 
    "Shadow Panthers", "Ethereal Butterflies", "None (Barren)"
  ];

  const trees = [
    "Obsidian Pillars", "Weeping Willows", "Giant Mushrooms", 
    "Crystal Spires", "Bioluminescent Kelp", "Fleshy Polyps", 
    "Fractal Branches", "Glass Trees", "None (Barren)"
  ];

  const rivers = [
    "Water", "Liquid Methane", "Molten Gold", "Quicksilver", 
    "Lava", "Acid", "Liquid Nitrogen", "Sparkling Plasma", "Dust (Dry)"
  ];

  const skies = [
    "Crimson Red", "Deep Purple", "Toxic Green", "Pitch Black", 
    "Golden Haze", "Azure Blue", "Neon Pink", "Static Noise"
  ];

  // Helper to pick random from array
  function pick(arr) {
    return arr[Math.floor(rand() * arr.length)];
  }

  // Generate Planet Traits
  const sizeObj = pick(sizes);
  const sizeMult = sizeObj.mult;
  const gravity = pick(sizeObj.gravs);
  const creature = pick(creatures);
  const tree = pick(trees);
  const river = pick(rivers);
  const sky = pick(skies);
  const moons = Math.floor(rand() * 6); // 0 to 5 moons

  const hue = Math.floor(rand() * 360);
  const saturation = 50 + Math.floor(rand() * 50); // 50-100%
  const lightness = 30 + Math.floor(rand() * 40); // 30-70%
  const colorStr = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const shadowColor = `hsl(${hue}, ${saturation}%, ${lightness - 20}%)`;

  // Update DOM
  document.getElementById('stat-size').textContent = sizeObj.label;
  document.getElementById('stat-gravity').textContent = gravity;
  document.getElementById('stat-creatures').textContent = creature;
  document.getElementById('stat-trees').textContent = tree;
  document.getElementById('stat-rivers').textContent = river;
  document.getElementById('stat-sky').textContent = sky;
  document.getElementById('stat-moons').textContent = moons;

  // Draw Starfield Background
  const starCanvas = document.getElementById('starfield');
  const sCtx = starCanvas.getContext('2d');
  starCanvas.width = window.innerWidth;
  starCanvas.height = window.innerHeight;

  sCtx.fillStyle = '#0f172a';
  sCtx.fillRect(0, 0, starCanvas.width, starCanvas.height);
  for(let i=0; i<300; i++) {
    sCtx.fillStyle = `rgba(255,255,255,${Math.random()})`;
    sCtx.beginPath();
    sCtx.arc(Math.random() * starCanvas.width, Math.random() * starCanvas.height, Math.random() * 2, 0, Math.PI*2);
    sCtx.fill();
  }

  // Draw Planet on Canvas
  const canvas = document.getElementById('planet-canvas');
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const baseRadius = 150;
  const r = baseRadius * sizeMult;

  // Draw Planet Body
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  
  // Fill gradient
  let grad = ctx.createRadialGradient(cx - r*0.3, cy - r*0.3, r*0.1, cx, cy, r);
  grad.addColorStop(0, `hsl(${hue}, ${saturation}%, ${lightness + 20}%)`);
  grad.addColorStop(0.6, colorStr);
  grad.addColorStop(1, shadowColor);
  ctx.fillStyle = grad;
  ctx.fill();

  // Draw Craters/Continents deterministically
  ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness - 15}%, 0.5)`;
  const numFeatures = 5 + Math.floor(rand() * 15);
  for(let i=0; i<numFeatures; i++) {
    let fx = cx + (rand() * 2 - 1) * r;
    let fy = cy + (rand() * 2 - 1) * r;
    let fr = 10 + rand() * 40;
    ctx.beginPath();
    ctx.ellipse(fx, fy, fr, fr * (0.5 + rand()*0.5), rand() * Math.PI, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.restore();

  // Draw atmospheric glow
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.lineWidth = 15;
  let skyHue = skies.indexOf(sky) * (360 / skies.length);
  ctx.strokeStyle = `hsla(${skyHue}, 80%, 60%, 0.3)`;
  ctx.stroke();

  // Draw Moons
  for(let i=0; i<moons; i++) {
    let moonDist = r + 40 + rand() * 100;
    let moonAngle = rand() * Math.PI * 2;
    let moonR = 5 + rand() * 15;
    let mx = cx + Math.cos(moonAngle) * moonDist;
    let my = cy + Math.sin(moonAngle) * moonDist;
    
    ctx.beginPath();
    ctx.arc(mx, my, moonR, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(0, 0%, ${40 + rand()*40}%)`;
    ctx.fill();
  }

});
