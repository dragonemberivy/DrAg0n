/**
 * FC 24 Squad Builder & Pack Opener Game Logic
 */

// --- PLAYER DATASETS (4-3-3 Formation) ---
const playerSets = {
  1: [ // Set 1: Legends & Icons (Default List)
    { id: "s1_yashin", name: "Lev Yashin", rating: 92, position: "GK", nation: "🇷🇺 Russia", club: "Icons", cardType: "icon", stats: { div: 93, han: 89, kic: 75, ref: 94, spd: 56, pos: 91 } },
    { id: "s1_rcarlos", name: "Roberto Carlos", rating: 90, position: "LB", nation: "🇧🇷 Brazil", club: "Icons", cardType: "icon", stats: { pac: 92, sho: 83, pas: 84, dri: 84, def: 83, phy: 84 } },
    { id: "s1_maldini", name: "Paolo Maldini", rating: 92, position: "LCB", nation: "🇮🇹 Italy", club: "Icons", cardType: "icon", stats: { pac: 86, sho: 56, pas: 75, dri: 72, def: 95, phy: 83 } },
    { id: "s1_ramos", name: "Sergio Ramos", rating: 89, position: "RCB", nation: "🇪🇸 Spain", club: "Real Madrid", cardType: "gold-rare", stats: { pac: 80, sho: 68, pas: 74, dri: 72, def: 89, phy: 85 } },
    { id: "s1_cafu", name: "Cafu", rating: 91, position: "RB", nation: "🇧🇷 Brazil", club: "Icons", cardType: "icon", stats: { pac: 90, sho: 72, pas: 82, dri: 85, def: 88, phy: 84 } },
    { id: "s1_pirlo", name: "Andrea Pirlo", rating: 90, position: "CDM", nation: "🇮🇹 Italy", club: "Icons", cardType: "icon", stats: { pac: 73, sho: 79, pas: 93, dri: 89, def: 78, phy: 67 } },
    { id: "s1_ronaldinho", name: "Ronaldinho", rating: 93, position: "LCM", nation: "🇧🇷 Brazil", club: "Icons", cardType: "icon", stats: { pac: 92, sho: 90, pas: 91, dri: 95, def: 37, phy: 81 } },
    { id: "s1_zidane", name: "Zinedine Zidane", rating: 94, position: "RCM", nation: "🇫🇷 France", club: "Icons", cardType: "icon", stats: { pac: 83, sho: 92, pas: 96, dri: 95, def: 75, phy: 86 } },
    { id: "s1_ronaldo", name: "C. Ronaldo", rating: 91, position: "LW", nation: "🇵🇹 Portugal", club: "Al Nassr", cardType: "gold-rare", stats: { pac: 90, sho: 93, pas: 82, dri: 88, def: 35, phy: 78 } },
    { id: "s1_zlatan", name: "Zlatan Ibrahimovic", rating: 87, position: "ST", nation: "🇸🇪 Sweden", club: "AC Milan", cardType: "gold-rare", stats: { pac: 77, sho: 88, pas: 80, dri: 83, def: 34, phy: 84 } },
    { id: "s1_messi", name: "Lionel Messi", rating: 90, position: "RW", nation: "🇦🇷 Argentina", club: "Inter Miami", cardType: "gold-rare", stats: { pac: 80, sho: 87, pas: 90, dri: 94, def: 33, phy: 64 } }
  ],
  2: [ // Set 2: Modern Elites (TOTY Style)
    { id: "s2_courtois", name: "Thibaut Courtois", rating: 90, position: "GK", nation: "🇧🇪 Belgium", club: "Real Madrid", cardType: "toty", stats: { div: 89, han: 90, kic: 76, ref: 93, spd: 46, pos: 90 } },
    { id: "s2_davies", name: "Alphonso Davies", rating: 84, position: "LB", nation: "🇨🇦 Canada", club: "Bayern Munich", cardType: "gold-rare", stats: { pac: 95, sho: 68, pas: 78, dri: 85, def: 76, phy: 77 } },
    { id: "s2_vandijk", name: "Virgil van Dijk", rating: 89, position: "LCB", nation: "🇳🇱 Netherlands", club: "Liverpool", cardType: "toty", stats: { pac: 78, sho: 60, pas: 71, dri: 72, def: 89, phy: 86 } },
    { id: "s2_dias", name: "Rúben Dias", rating: 89, position: "RCB", nation: "🇵🇹 Portugal", club: "Man City", cardType: "toty", stats: { pac: 62, sho: 39, pas: 66, dri: 69, def: 89, phy: 87 } },
    { id: "s2_hakimi", name: "Achraf Hakimi", rating: 84, position: "RB", nation: "🇲🇦 Morocco", club: "PSG", cardType: "gold-rare", stats: { pac: 92, sho: 75, pas: 80, dri: 80, def: 76, phy: 78 } },
    { id: "s2_rodri", name: "Rodri", rating: 89, position: "CDM", nation: "🇪🇸 Spain", club: "Man City", cardType: "toty", stats: { pac: 58, sho: 73, pas: 85, dri: 80, def: 89, phy: 84 } },
    { id: "s2_debruyne", name: "K. De Bruyne", rating: 91, position: "LCM", nation: "🇧🇪 Belgium", club: "Man City", cardType: "toty", stats: { pac: 72, sho: 88, pas: 94, dri: 87, def: 65, phy: 78 } },
    { id: "s2_bellingham", name: "Jude Bellingham", rating: 87, position: "RCM", nation: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 England", club: "Real Madrid", cardType: "toty", stats: { pac: 79, sho: 82, pas: 81, dri: 86, def: 82, phy: 83 } },
    { id: "s2_vinicius", name: "Vinicius Jr.", rating: 89, position: "LW", nation: "🇧🇷 Brazil", club: "Real Madrid", cardType: "toty", stats: { pac: 95, sho: 82, pas: 79, dri: 90, def: 29, phy: 68 } },
    { id: "s2_haaland", name: "Erling Haaland", rating: 91, position: "ST", nation: "🇳🇴 Norway", club: "Man City", cardType: "toty", stats: { pac: 89, sho: 93, pas: 66, dri: 80, def: 45, phy: 88 } },
    { id: "s2_salah", name: "Mohamed Salah", rating: 89, position: "RW", nation: "🇪🇬 Egypt", club: "Liverpool", cardType: "gold-rare", stats: { pac: 89, sho: 87, pas: 81, dri: 88, def: 45, phy: 75 } }
  ],
  3: [ // Set 3: Classic Champions
    { id: "s3_buffon", name: "Gianluigi Buffon", rating: 91, position: "GK", nation: "🇮🇹 Italy", club: "Icons", cardType: "icon", stats: { div: 90, han: 91, kic: 74, ref: 92, spd: 50, pos: 90 } },
    { id: "s3_marcelo", name: "Marcelo", rating: 86, position: "LB", nation: "🇧🇷 Brazil", club: "Icons", cardType: "icon", stats: { pac: 79, sho: 73, pas: 83, dri: 89, def: 77, phy: 78 } },
    { id: "s3_puyol", name: "Carles Puyol", rating: 90, position: "LCB", nation: "🇪🇸 Spain", club: "Icons", cardType: "icon", stats: { pac: 70, sho: 45, pas: 65, dri: 60, def: 92, phy: 90 } },
    { id: "s3_nesta", name: "Alessandro Nesta", rating: 90, position: "RCB", nation: "🇮🇹 Italy", club: "Icons", cardType: "icon", stats: { pac: 72, sho: 38, pas: 63, dri: 65, def: 92, phy: 84 } },
    { id: "s3_zanetti", name: "Javier Zanetti", rating: 89, position: "RB", nation: "🇦🇷 Argentina", club: "Icons", cardType: "icon", stats: { pac: 86, sho: 62, pas: 84, dri: 82, def: 86, phy: 80 } },
    { id: "s3_vieira", name: "Patrick Vieira", rating: 88, position: "CDM", nation: "🇫🇷 France", club: "Icons", cardType: "icon", stats: { pac: 81, sho: 75, pas: 78, dri: 79, def: 88, phy: 90 } },
    { id: "s3_maradona", name: "Diego Maradona", rating: 95, position: "LCM", nation: "🇦🇷 Argentina", club: "Icons", cardType: "icon", stats: { pac: 92, sho: 93, pas: 90, dri: 97, def: 39, phy: 75 } },
    { id: "s3_iniesta", name: "Andres Iniesta", rating: 90, position: "RCM", nation: "🇪🇸 Spain", club: "Barcelona", cardType: "icon", stats: { pac: 78, sho: 70, pas: 91, dri: 92, def: 62, phy: 60 } },
    { id: "s3_henry", name: "Thierry Henry", rating: 91, position: "LW", nation: "🇫🇷 France", club: "Icons", cardType: "icon", stats: { pac: 94, sho: 90, pas: 83, dri: 90, def: 41, phy: 80 } },
    { id: "s3_ronaldo", name: "Ronaldo Nazário", rating: 94, position: "ST", nation: "🇧🇷 Brazil", club: "Icons", cardType: "icon", stats: { pac: 97, sho: 93, pas: 80, dri: 94, def: 35, phy: 80 } },
    { id: "s3_beckham", name: "David Beckham", rating: 89, position: "RW", nation: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 England", club: "Icons", cardType: "icon", stats: { pac: 80, sho: 84, pas: 95, dri: 82, def: 70, phy: 75 } }
  ],
  4: [ // Set 4: Future Stars
    { id: "s4_donnarumma", name: "G. Donnarumma", rating: 87, position: "GK", nation: "🇮🇹 Italy", club: "PSG", cardType: "future-star", stats: { div: 90, han: 83, kic: 79, ref: 89, spd: 52, pos: 85 } },
    { id: "s4_balde", name: "Alejandro Balde", rating: 81, position: "LB", nation: "🇪🇸 Spain", club: "Barcelona", cardType: "future-star", stats: { pac: 91, sho: 50, pas: 71, dri: 78, def: 75, phy: 66 } },
    { id: "s4_saliba", name: "William Saliba", rating: 84, position: "LCB", nation: "🇫🇷 France", club: "Arsenal", cardType: "future-star", stats: { pac: 82, sho: 30, pas: 69, dri: 72, def: 84, phy: 82 } },
    { id: "s4_gvardiol", name: "Joško Gvardiol", rating: 82, position: "RCB", nation: "🇭🇷 Croatia", club: "Man City", cardType: "future-star", stats: { pac: 78, sho: 54, pas: 70, dri: 79, def: 82, phy: 80 } },
    { id: "s4_frimpong", name: "J. Frimpong", rating: 83, position: "RB", nation: "🇳🇱 Netherlands", club: "Leverkusen", cardType: "future-star", stats: { pac: 94, sho: 67, pas: 78, dri: 84, def: 74, phy: 68 } },
    { id: "s4_camavinga", name: "E. Camavinga", rating: 82, position: "CDM", nation: "🇫🇷 France", club: "Real Madrid", cardType: "future-star", stats: { pac: 79, sho: 66, pas: 80, dri: 82, def: 80, phy: 78 } },
    { id: "s4_musiala", name: "Jamal Musiala", rating: 86, position: "LCM", nation: "🇩🇪 Germany", club: "Bayern Munich", cardType: "future-star", stats: { pac: 84, sho: 81, pas: 79, dri: 90, def: 63, phy: 64 } },
    { id: "s4_pedri", name: "Pedri", rating: 85, position: "RCM", nation: "🇪🇸 Spain", club: "Barcelona", cardType: "future-star", stats: { pac: 78, sho: 69, pas: 83, dri: 88, def: 68, phy: 66 } },
    { id: "s4_palmer", name: "Cole Palmer", rating: 83, position: "LW", nation: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 England", club: "Chelsea", cardType: "future-star", stats: { pac: 80, sho: 82, pas: 81, dri: 84, def: 45, phy: 60 } },
    { id: "s4_alvarez", name: "Julián Álvarez", rating: 80, position: "ST", nation: "🇦🇷 Argentina", club: "Atletico Madrid", cardType: "future-star", stats: { pac: 81, sho: 82, pas: 78, dri: 83, def: 45, phy: 74 } },
    { id: "s4_yamal", name: "Lamine Yamal", rating: 81, position: "RW", nation: "🇪🇸 Spain", club: "Barcelona", cardType: "future-star", stats: { pac: 88, sho: 76, pas: 76, dri: 85, def: 31, phy: 55 } }
  ]
};

// All players flattened into one lookup map
const allPlayersMap = {};
Object.values(playerSets).forEach(set => {
  set.forEach(p => {
    allPlayersMap[p.id] = p;
  });
});

// --- AUDIO SYNTHESIZER (Web Audio API) ---
class AudioController {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playClick() {
    if (this.muted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playPlace() {
    if (this.muted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const noiseNode = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    
    // Synth pop
    osc.type = "triangle";
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playOpenPack() {
    if (this.muted) return;
    this.init();
    
    // Low rumble leading to explosion
    const rumbleOsc = this.ctx.createOscillator();
    const rumbleGain = this.ctx.createGain();
    rumbleOsc.type = "sawtooth";
    rumbleOsc.frequency.setValueAtTime(55, this.ctx.currentTime);
    rumbleOsc.frequency.linearRampToValueAtTime(110, this.ctx.currentTime + 1.2);
    
    rumbleGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    rumbleGain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 1.2);
    rumbleGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.3);
    
    rumbleOsc.connect(rumbleGain);
    rumbleGain.connect(this.ctx.destination);
    rumbleOsc.start();
    rumbleOsc.stop(this.ctx.currentTime + 1.3);

    // Triumphant sound at 1.2s
    setTimeout(() => {
      if (this.muted) return;
      // Synthesize a fanfare
      const notes = [261.63, 329.63, 392.00, 523.25]; // C major chord
      notes.forEach((freq, idx) => {
        const oscF = this.ctx.createOscillator();
        const gainF = this.ctx.createGain();
        oscF.type = "sine";
        oscF.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.15);
        
        gainF.gain.setValueAtTime(0, this.ctx.currentTime);
        gainF.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + idx * 0.15 + 0.05);
        gainF.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.15 + 0.8);
        
        oscF.connect(gainF);
        gainF.connect(this.ctx.destination);
        oscF.start();
        oscF.stop(this.ctx.currentTime + idx * 0.15 + 0.85);
      });
    }, 1200);
  }

  playCheer() {
    if (this.muted) return;
    this.init();
    
    // Synthesize stadium roar using white noise
    const bufferSize = this.ctx.sampleRate * 2.5; // 2.5 seconds
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 400;
    filter.Q.value = 0.8;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.4);
    
    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    whiteNoise.start();
    whiteNoise.stop(this.ctx.currentTime + 2.5);

    // Play high arpeggio
    const chord = [392.00, 493.88, 587.33, 783.99]; // G Major
    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      oscGain.gain.setValueAtTime(0, this.ctx.currentTime);
      oscGain.gain.linearRampToValueAtTime(0.07, this.ctx.currentTime + idx * 0.1 + 0.05);
      oscGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.1 + 1.2);
      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + idx * 0.1 + 1.25);
    });
  }
}

const audioCtrl = new AudioController();

// --- STATE MANAGEMENT ---
let currentSetIndex = 1;
const squadState = {
  GK: null,
  LB: null,
  LCB: null,
  RCB: null,
  RB: null,
  CDM: null,
  LCM: null,
  RCM: null,
  LW: null,
  ST: null,
  RW: null
};

// Unlocked players from Pack Opener (start with default unlocked for legends, others need pack opening or are unlocked by default depending on mode)
let unlockedPlayers = new Set();
// Auto-unlock Set 1 so the user can play with the requested defaults immediately
playerSets[1].forEach(p => unlockedPlayers.add(p.id));

// Mobile interaction tap state
let selectedBenchCardId = null;

// --- FIREWORKS CANVAS ---
class CelebrationFX {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.active = false;
    
    window.addEventListener("resize", () => this.resize());
    this.resize();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  start() {
    this.active = true;
    this.particles = [];
    this.resize();
    this.animate();
    
    // Spawn several bursts
    for (let i = 0; i < 8; i++) {
      setTimeout(() => this.spawnBurst(), i * 350);
    }
    
    setTimeout(() => {
      this.active = false;
    }, 4500);
  }

  spawnBurst() {
    if (!this.active) return;
    const x = Math.random() * this.canvas.width;
    const y = Math.random() * (this.canvas.height * 0.6) + this.canvas.height * 0.15;
    const colors = ["#fbbf24", "#38bdf8", "#a855f7", "#4ade80", "#f43f5e", "#22d3ee"];
    const baseColor = colors[Math.floor(Math.random() * colors.length)];
    
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: baseColor,
        size: Math.random() * 3 + 2,
        gravity: 0.08,
        friction: 0.97
      });
    }
  }

  animate() {
    if (!this.active && this.particles.length === 0) {
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      return;
    }
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.015;
      
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
    
    requestAnimationFrame(() => this.animate());
  }
}

let fxController = null;

// --- CHEMISTRY CONNECTIONS DEFINITION (4-3-3 formation) ---
const chemLinks = [
  { from: "GK", to: "LCB" },
  { from: "GK", to: "RCB" },
  
  { from: "LB", to: "LCB" },
  { from: "LB", to: "LCM" },
  
  { from: "RB", to: "RCB" },
  { from: "RB", to: "RCM" },
  
  { from: "LCB", to: "RCB" },
  { from: "LCB", to: "CDM" },
  { from: "RCB", to: "CDM" },
  
  { from: "CDM", to: "LCM" },
  { from: "CDM", to: "RCM" },
  
  { from: "LCM", to: "LW" },
  { from: "LCM", to: "ST" },
  
  { from: "RCM", to: "RW" },
  { from: "RCM", to: "ST" },
  
  { from: "LW", to: "ST" },
  { from: "RW", to: "ST" }
];

// --- CHEMISTRY AND RATING COMPUTATION ---
function calculateSquadStats() {
  let totalRating = 0;
  let filledCount = 0;
  let rawAvgRating = 0;
  let chemistry = 0;
  
  const placedPlayers = Object.entries(squadState)
    .filter(([pos, pId]) => pId !== null)
    .map(([pos, pId]) => ({ slotPos: pos, player: allPlayersMap[pId] }));
    
  filledCount = placedPlayers.length;
  
  // Calculate average rating
  if (filledCount > 0) {
    placedPlayers.forEach(item => {
      totalRating += item.player.rating;
    });
    rawAvgRating = Math.round(totalRating / 11); // Standardized to full team slots
  }

  // Calculate chemistry for each player on pitch (maximum 3 points each)
  // FC 24 Ultimate Team Chemistry logic:
  // - A player gets 0 chemistry if placed in the wrong position.
  // - Icons get 3 chemistry points automatically if in correct position.
  // - Other players get chemistry based on matches:
  //   - Base: 1 chem for being in the correct position.
  //   - Nation link: +1 chem if there is at least one other player on pitch of the same nation.
  //   - Club/Set link: +1 chem if there is at least one other player on pitch of the same club or set.
  //   - Max is 3 per player.
  
  const playerChemScore = {};
  
  placedPlayers.forEach(item => {
    const slot = item.slotPos;
    const p = item.player;
    
    // Check correct position mapping
    const isCorrectPos = (p.position === slot);
    
    if (!isCorrectPos) {
      playerChemScore[p.id] = 0;
      return;
    }
    
    if (p.cardType === "icon") {
      playerChemScore[p.id] = 3;
      return;
    }
    
    let chem = 1; // Base correct position chem
    
    // Set match strength (number of players of the same set prefix on pitch)
    const currentSetPrefix = p.id.split("_")[0];
    const sameSetCount = placedPlayers.filter(other => other.player.id.split("_")[0] === currentSetPrefix).length;
    
    if (sameSetCount >= 8) {
      chem += 2;
    } else if (sameSetCount >= 5) {
      chem += 1;
    }
    
    // Nation Match check (if not already maxed out)
    if (chem < 3) {
      const hasNationMatch = placedPlayers.some(other => {
        return other.player.id !== p.id && other.player.nation === p.nation;
      });
      if (hasNationMatch) chem += 1;
    }
    
    // Club Match check (if not already maxed out)
    if (chem < 3) {
      const hasClubMatch = placedPlayers.some(other => {
        return other.player.id !== p.id && other.player.club === p.club;
      });
      if (hasClubMatch) chem += 1;
    }
    
    playerChemScore[p.id] = Math.min(chem, 3);
  });
  
  // Sum up all chemistry
  placedPlayers.forEach(item => {
    chemistry += playerChemScore[item.player.id] || 0;
  });
  
  // Display chemistry
  document.getElementById("avg-rating-val").textContent = rawAvgRating;
  document.getElementById("avg-rating-progress").style.width = `${(rawAvgRating / 99) * 100}%`;
  document.getElementById("chem-val").textContent = `${chemistry}/33`;
  document.getElementById("chem-progress").style.width = `${(chemistry / 33) * 100}%`;
  
  // Update slot chemistry indicators visually
  Object.keys(squadState).forEach(pos => {
    const pId = squadState[pos];
    const slotEl = document.querySelector(`.pitch-slot[data-pos="${pos}"]`);
    if (!slotEl) return;
    
    const chemPipContainer = slotEl.querySelector(".chem-pips");
    if (!chemPipContainer) return;
    
    chemPipContainer.innerHTML = "";
    
    if (pId === null) {
      slotEl.classList.remove("correct", "incorrect");
      return;
    }
    
    const player = allPlayersMap[pId];
    const score = playerChemScore[pId] || 0;
    
    if (player.position === pos) {
      slotEl.classList.add("correct");
      slotEl.classList.remove("incorrect");
      // Add green filled dots (max 3)
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement("span");
        if (i < score) {
          dot.className = "pip active";
        } else {
          dot.className = "pip";
        }
        chemPipContainer.appendChild(dot);
      }
    } else {
      slotEl.classList.add("incorrect");
      slotEl.classList.remove("correct");
      // Add red dot representing out of position
      const dot = document.createElement("span");
      dot.className = "pip active warning";
      chemPipContainer.appendChild(dot);
    }
  });

  // Redraw SVG chemistry links
  drawChemistryLinks(playerChemScore);
  
  // Check completion achievement
  if (chemistry === 33 && filledCount === 11) {
    triggerVictoryCelebration();
  }
}

// --- VICTORY CELEBRATION ---
let lastVictoryTime = 0;
function triggerVictoryCelebration() {
  const now = Date.now();
  if (now - lastVictoryTime < 10000) return; // Prevent spamming
  lastVictoryTime = now;
  
  audioCtrl.playCheer();
  if (fxController) {
    fxController.start();
  }
  
  // Show celebration dialog overlay
  const overlay = document.createElement("div");
  overlay.className = "celebration-banner-overlay";
  overlay.innerHTML = `
    <div class="celebration-banner-modal">
      <h1 class="glow-text font-italic">🏆 SQUAD COMPLETE!</h1>
      <p style="font-size:1.25rem;">Ultimate Team achieved 33/33 Chemistry</p>
      <div style="font-size:2rem; font-weight:800; color:#fbbf24; margin:1rem 0;">
        RATING: ${document.getElementById("avg-rating-val").textContent} | CHEM: 33/33
      </div>
      <button onclick="this.parentElement.parentElement.remove()" style="margin-top:10px;">Fantastic!</button>
    </div>
  `;
  document.body.appendChild(overlay);
  
  // Run CSS confetti/particles if supported
  setTimeout(() => {
    overlay.classList.add("show");
  }, 10);
}

// --- SVG CHEMISTRY LINE DRAWER ---
function drawChemistryLinks(playerChemScore) {
  const svg = document.getElementById("pitch-chem-svg");
  if (!svg) return;
  
  // Clear existing lines
  svg.innerHTML = "";
  
  // Fetch scale container bounds
  const pitchContainer = document.querySelector(".pitch-view-container");
  const pitchBounds = pitchContainer.getBoundingClientRect();
  
  svg.setAttribute("viewBox", `0 0 ${pitchBounds.width} ${pitchBounds.height}`);
  svg.style.width = `${pitchBounds.width}px`;
  svg.style.height = `${pitchBounds.height}px`;

  chemLinks.forEach(link => {
    const slotFrom = document.querySelector(`.pitch-slot[data-pos="${link.from}"]`);
    const slotTo = document.querySelector(`.pitch-slot[data-pos="${link.to}"]`);
    
    if (!slotFrom || !slotTo) return;
    
    const fromBounds = slotFrom.getBoundingClientRect();
    const toBounds = slotTo.getBoundingClientRect();
    
    // Relative coordinates
    const x1 = (fromBounds.left + fromBounds.width / 2) - pitchBounds.left;
    const y1 = (fromBounds.top + fromBounds.height / 2) - pitchBounds.top;
    const x2 = (toBounds.left + toBounds.width / 2) - pitchBounds.left;
    const y2 = (toBounds.top + toBounds.height / 2) - pitchBounds.top;
    
    const pFromId = squadState[link.from];
    const pToId = squadState[link.to];
    
    let lineType = "empty"; // empty, inactive, active
    let chemIntensity = 0;
    
    if (pFromId !== null && pToId !== null) {
      const pFrom = allPlayersMap[pFromId];
      const pTo = allPlayersMap[pToId];
      
      const fromCorrect = (pFrom.position === link.from);
      const toCorrect = (pTo.position === link.to);
      
      if (fromCorrect && toCorrect) {
        // Evaluate connection relationship (same nation, same club, or same set)
        const sameNation = pFrom.nation === pTo.nation;
        const sameClub = pFrom.club === pTo.club;
        const sameSet = pFrom.id.split("_")[0] === pTo.id.split("_")[0];
        
        if (sameNation || sameClub || sameSet || pFrom.cardType === "icon" || pTo.cardType === "icon") {
          lineType = "active";
        } else {
          lineType = "inactive";
        }
      } else {
        lineType = "inactive";
      }
    }
    
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    
    if (lineType === "active") {
      line.setAttribute("stroke", "#4ade80");
      line.setAttribute("stroke-width", "3.5");
      line.setAttribute("filter", "url(#glow)");
      line.style.opacity = "0.95";
      line.style.strokeDasharray = "none";
    } else if (lineType === "inactive") {
      line.setAttribute("stroke", "#e2e8f0");
      line.setAttribute("stroke-width", "1.5");
      line.style.opacity = "0.3";
      line.style.strokeDasharray = "5, 5";
    } else {
      line.setAttribute("stroke", "rgba(255, 255, 255, 0.08)");
      line.setAttribute("stroke-width", "1.5");
      line.style.opacity = "0.2";
      line.style.strokeDasharray = "4, 4";
    }
    
    svg.appendChild(line);
  });
}

// Redraw lines on resize
window.addEventListener("resize", () => {
  calculateSquadStats();
});

// --- CARD BUILDER COMPONENT ---
function createCardHTML(p, showStats = true) {
  const isGK = (p.position === "GK");
  
  // Custom theme labels
  let cardThemeClass = "rare-gold";
  if (p.cardType === "icon") cardThemeClass = "fut-icon";
  if (p.cardType === "toty") cardThemeClass = "fut-toty";
  if (p.cardType === "future-star") cardThemeClass = "fut-future-star";
  
  const cardIdAttr = p.id ? `id="card-${p.id}"` : '';

  // Get flag emoji and name
  const flagEmoji = p.nation.split(" ")[0];
  
  // Outfield / GK Stats mapping
  const statsHTML = isGK ? `
    <div class="stat-col"><div>${p.stats.div}</div><div>DIV</div></div>
    <div class="stat-col"><div>${p.stats.han}</div><div>HAN</div></div>
    <div class="stat-col"><div>${p.stats.kic}</div><div>KIC</div></div>
    <div class="stat-col"><div>${p.stats.ref}</div><div>REF</div></div>
    <div class="stat-col"><div>${p.stats.spd}</div><div>SPD</div></div>
    <div class="stat-col"><div>${p.stats.pos}</div><div>POS</div></div>
  ` : `
    <div class="stat-col"><div>${p.stats.pac}</div><div>PAC</div></div>
    <div class="stat-col"><div>${p.stats.sho}</div><div>SHO</div></div>
    <div class="stat-col"><div>${p.stats.pas}</div><div>PAS</div></div>
    <div class="stat-col"><div>${p.stats.dri}</div><div>DRI</div></div>
    <div class="stat-col"><div>${p.stats.def}</div><div>DEF</div></div>
    <div class="stat-col"><div>${p.stats.phy}</div><div>PHY</div></div>
  `;

  // Mini Action Shot illustration background
  const silhouetteSVG = `
    <svg class="player-avatar" viewBox="0 0 100 100">
      <defs>
        <radialGradient id="avatarGlow-${p.id}" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.25)" />
          <stop offset="100%" stop-color="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="40" r="30" fill="url(#avatarGlow-${p.id})" />
      <!-- Stylized silhouette -->
      <path d="M50 15 C40 15 35 22 35 32 C35 45 42 48 50 48 C58 48 65 45 65 32 C65 22 60 15 50 15 Z M22 85 C22 70 30 58 50 58 C70 58 78 70 78 85 L22 85 Z" fill="rgba(255,255,255,0.7)" />
      <!-- Accent colors dynamic matching card class -->
      <path d="M35 58 Q50 64 65 58 L68 70 Q50 78 32 70 Z" fill="${p.cardType === 'icon' ? '#d4af37' : p.cardType === 'toty' ? '#38bdf8' : p.cardType === 'future-star' ? '#f43f5e' : '#fbbf24'}" opacity="0.8"/>
    </svg>
  `;

  return `
    <div ${cardIdAttr} class="fut-card ${cardThemeClass}" draggable="true" ondragstart="handleDragStart(event)" data-player-id="${p.id}">
      <div class="card-glow"></div>
      
      <!-- Top info: Rating & Pos -->
      <div class="card-top">
        <div class="card-rating-box">
          <span class="card-ovr">${p.rating}</span>
          <span class="card-pos">${p.position}</span>
        </div>
        <div class="card-meta">
          <div class="card-flag" title="${p.nation}">${flagEmoji}</div>
          <div class="card-badge" title="${p.club}">${p.club.substring(0, 3).toUpperCase()}</div>
        </div>
      </div>
      
      <!-- Action shot / Silhouette -->
      <div class="card-avatar-container">
        ${silhouetteSVG}
      </div>
      
      <!-- Player Name -->
      <div class="card-name">${p.name}</div>
      
      <div class="card-divider"></div>
      
      <!-- Attributes Stats -->
      <div class="card-stats-grid">
        ${statsHTML}
      </div>
    </div>
  `;
}

// --- POPULATE BENCH / RESERVE LIST ---
function renderBench() {
  const bench = document.getElementById("bench-list");
  if (!bench) return;
  
  bench.innerHTML = "";
  
  const activeSet = playerSets[currentSetIndex];
  
  // Filter out players already on the pitch
  const placedIds = Object.values(squadState);
  const benchPlayers = activeSet.filter(p => !placedIds.includes(p.id));
  
  if (benchPlayers.length === 0) {
    bench.innerHTML = `<div style="grid-column: 1/-1; padding: 2rem; text-align: center; color: var(--text-muted);">🎉 All players placed on the pitch!</div>`;
    return;
  }
  
  benchPlayers.forEach(p => {
    const isUnlocked = unlockedPlayers.has(p.id);
    
    const wrapper = document.createElement("div");
    wrapper.className = `bench-item-wrapper ${isUnlocked ? '' : 'locked-pack'}`;
    
    if (isUnlocked) {
      wrapper.innerHTML = createCardHTML(p);
      const card = wrapper.querySelector(".fut-card");
      
      // Tap selection helper for mobile
      card.addEventListener("click", (e) => {
        e.stopPropagation();
        audioCtrl.playClick();
        
        // Remove active class from other bench items
        document.querySelectorAll(".bench-item-wrapper .fut-card").forEach(el => {
          el.classList.remove("selected-tap");
        });
        
        if (selectedBenchCardId === p.id) {
          selectedBenchCardId = null;
        } else {
          selectedBenchCardId = p.id;
          card.classList.add("selected-tap");
        }
      });
      
      // Add dynamic 3D tilt effects
      applyCardTiltEffect(card);
    } else {
      wrapper.innerHTML = `
        <div class="locked-card-placeholder">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔒</div>
          <div style="font-size: 0.9rem; font-weight: bold;">Locked</div>
          <div style="font-size: 0.75rem; color: #a855f7;">Open Pack to Unlock!</div>
        </div>
      `;
    }
    
    bench.appendChild(wrapper);
  });
}

// --- 3D TILT EFFECT FOR PREMIUM CARDS ---
function applyCardTiltEffect(card) {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within element
    const y = e.clientY - rect.top;  // y position within element
    
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    
    const angleX = (yc - y) / 10; // Max tilt degrees
    const angleY = (x - xc) / 10;
    
    card.style.transform = `perspective(500px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale(1.03)`;
    
    // Position reflection glow
    const glow = card.querySelector(".card-glow");
    if (glow) {
      glow.style.background = `radial-gradient(circle at ${(x / rect.width) * 100}% ${(y / rect.height) * 100}%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 60%)`;
    }
  });
  
  card.addEventListener("mouseleave", () => {
    card.style.transform = "perspective(500px) rotateX(0deg) rotateY(0deg) scale(1)";
    const glow = card.querySelector(".card-glow");
    if (glow) {
      glow.style.background = "none";
    }
  });
}

// --- DRAG AND DROP EVENTS ---
window.handleDragStart = function(ev) {
  ev.dataTransfer.setData("text/plain", ev.target.dataset.playerId);
  ev.dataTransfer.effectAllowed = "move";
  // Add dragging class
  ev.target.classList.add("dragging");
  audioCtrl.playClick();
};

document.addEventListener("dragend", (ev) => {
  if (ev.target.classList) {
    ev.target.classList.remove("dragging");
  }
});

// Configure Drop Slots
function setupDropSlots() {
  const slots = document.querySelectorAll(".pitch-slot");
  slots.forEach(slot => {
    slot.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });
    
    slot.addEventListener("dragenter", (e) => {
      e.preventDefault();
      slot.classList.add("drag-hover");
    });
    
    slot.addEventListener("dragleave", () => {
      slot.classList.remove("drag-hover");
    });
    
    slot.addEventListener("drop", (e) => {
      e.preventDefault();
      slot.classList.remove("drag-hover");
      
      const playerId = e.dataTransfer.getData("text/plain");
      placePlayerInSlot(playerId, slot.dataset.pos);
    });
    
    // Tap to assign for mobile and standard clicks
    slot.addEventListener("click", () => {
      const pos = slot.dataset.pos;
      
      // If slot is filled, click removes player back to bench
      if (squadState[pos] !== null) {
        removePlayerFromSlot(pos);
        return;
      }
      
      // If we have a selected bench card, place it
      if (selectedBenchCardId) {
        placePlayerInSlot(selectedBenchCardId, pos);
        selectedBenchCardId = null;
      }
    });
  });
  
  // Bench drop handler (drag back to bench)
  const bench = document.getElementById("bench-list");
  if (bench) {
    bench.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    bench.addEventListener("drop", (e) => {
      e.preventDefault();
      const playerId = e.dataTransfer.getData("text/plain");
      
      // Find where player is currently placed
      const originPos = Object.keys(squadState).find(key => squadState[key] === playerId);
      if (originPos) {
        removePlayerFromSlot(originPos);
      }
    });
  }
}

// Action to place player in a slot
function placePlayerInSlot(playerId, targetPos) {
  if (!playerId || !targetPos) return;
  
  const playerObj = allPlayersMap[playerId];
  if (!playerObj) return;

  // Double check if player is unlocked
  if (!unlockedPlayers.has(playerId)) {
    alert("You must open a pack to unlock this player first!");
    return;
  }
  
  // If player is already on pitch elsewhere, swap or remove from previous slot
  const currentSlot = Object.keys(squadState).find(key => squadState[key] === playerId);
  
  // If there's already a player in the target slot
  const displacedPlayerId = squadState[targetPos];
  
  if (currentSlot) {
    // If player is moved from one pitch slot to another
    squadState[currentSlot] = displacedPlayerId;
  }
  
  squadState[targetPos] = playerId;
  
  // Render visual cards inside pitch slots
  updatePitchSlots();
  
  // Update bench pool
  renderBench();
  
  // Recalculate stats
  calculateSquadStats();
  
  audioCtrl.playPlace();
}

// Action to remove player from a slot back to bench
function removePlayerFromSlot(pos) {
  if (squadState[pos] === null) return;
  
  squadState[pos] = null;
  
  updatePitchSlots();
  renderBench();
  calculateSquadStats();
  audioCtrl.playClick();
}

// Update the DOM cards on the pitch
function updatePitchSlots() {
  Object.keys(squadState).forEach(pos => {
    const pId = squadState[pos];
    const slotEl = document.querySelector(`.pitch-slot[data-pos="${pos}"]`);
    if (!slotEl) return;
    
    const cardTarget = slotEl.querySelector(".slot-card-target");
    if (!cardTarget) return;
    
    if (pId === null) {
      // Empty slot state
      cardTarget.innerHTML = `
        <div class="empty-card-outline">
          <div class="pos-badge">${pos}</div>
          <div class="plus-icon">+</div>
        </div>
      `;
      slotEl.classList.remove("filled");
    } else {
      // Placed player card state
      const player = allPlayersMap[pId];
      cardTarget.innerHTML = createCardHTML(player);
      
      const card = cardTarget.querySelector(".fut-card");
      // Disable card level drag start internally to avoid browser conflicts, handled on wrapper
      card.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", pId);
      });
      
      applyCardTiltEffect(card);
      slotEl.classList.add("filled");
    }
  });
}

// --- PACK OPENING GENERATOR ---
window.openPack = function() {
  const packOpenSect = document.getElementById("pack-reveal-screen");
  if (!packOpenSect) return;

  audioCtrl.playOpenPack();
  
  // Reset screen
  packOpenSect.style.display = "flex";
  packOpenSect.innerHTML = `
    <div class="pack-opening-container">
      <div class="pack-wrapper-animated" id="pack-wrapper-anim">
        <div class="gold-pack-ribbon"></div>
        <div class="pack-face">
          <div class="logo-fut">FC 24</div>
          <div class="pack-name-txt">MEGA PLAYER PACK</div>
          <div class="pack-glow-spark"></div>
        </div>
      </div>
      <div id="walkout-stage" class="walkout-stage-hidden">
        <!-- Reveal elements filled dynamically -->
      </div>
    </div>
  `;

  const packWrapper = document.getElementById("pack-wrapper-anim");
  
  // Pack click animation trigger
  packWrapper.addEventListener("click", () => {
    packWrapper.classList.add("rip-open");
    
    // After shake & rip open duration, show walkout player
    setTimeout(() => {
      triggerWalkoutReveal();
    }, 1200);
  });
};

function triggerWalkoutReveal() {
  const walkoutStage = document.getElementById("walkout-stage");
  const packWrapper = document.getElementById("pack-wrapper-anim");
  if (!walkoutStage) return;
  
  // Hide pack cover
  if (packWrapper) packWrapper.style.display = "none";
  
  walkoutStage.className = "walkout-stage-visible";
  
  // Select active set players that are currently locked, or a random subset from set
  const activeSet = playerSets[currentSetIndex];
  
  // Grab 5 random players from this set to show in pack.
  // Make sure at least one is the "Walkout" player (highest rating)
  const sortedSet = [...activeSet].sort((a,b) => b.rating - a.rating);
  const walkoutPlayer = sortedSet[0]; // Highest rated is the walkout hero
  
  // Unlock all players in this opened set pack
  activeSet.forEach(p => {
    unlockedPlayers.add(p.id);
  });
  
  // Save unlocked state to UI and reload bench
  renderBench();
  calculateSquadStats();
  
  // Walkout animation timeline
  walkoutStage.innerHTML = `
    <div class="walkout-flares"></div>
    <div class="walkout-stats-reveal" id="walkout-stats-item">
      <div style="font-size: 1.5rem; color: #fbbf24;">${walkoutPlayer.cardType.toUpperCase()}</div>
      <div class="stat-reveal-line" style="--d:0.2s">RATING: ${walkoutPlayer.rating}</div>
      <div class="stat-reveal-line" style="--d:0.4s">POS: ${walkoutPlayer.position}</div>
      <div class="stat-reveal-line" style="--d:0.6s">NATION: ${walkoutPlayer.nation}</div>
      <div class="stat-reveal-line" style="--d:0.8s">CLUB: ${walkoutPlayer.club}</div>
    </div>
    
    <div class="walkout-card-holder" id="walkout-card-item">
      ${createCardHTML(walkoutPlayer)}
    </div>
    
    <div class="walkout-pack-contents-drawer" id="pack-drawer">
      <h3 style="color:#fff; text-shadow:0 0 10px rgba(0,0,0,0.5);">PACK CONTENTS UNLOCKED</h3>
      <div class="pack-unlocked-grid">
        ${activeSet.map(p => `
          <div class="mini-unlocked-card">
            <span style="color:#fbbf24; font-weight:800;">${p.rating}</span>
            <span style="font-size:0.8rem;">${p.position}</span>
            <span style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:80px;">${p.name}</span>
          </div>
        `).join("")}
      </div>
      <button onclick="closePackReveal()" style="margin-top:1.5rem; width:200px;">Send to Club</button>
    </div>
  `;

  // Animate walkout elements entry
  setTimeout(() => {
    const statsItem = document.getElementById("walkout-stats-item");
    const cardItem = document.getElementById("walkout-card-item");
    const drawerItem = document.getElementById("pack-drawer");
    
    if (statsItem) statsItem.classList.add("reveal");
    if (cardItem) cardItem.classList.add("reveal");
    if (drawerItem) {
      setTimeout(() => drawerItem.classList.add("reveal"), 1500);
    }
  }, 100);
}

window.closePackReveal = function() {
  const packOpenSect = document.getElementById("pack-reveal-screen");
  if (packOpenSect) {
    packOpenSect.style.display = "none";
  }
  audioCtrl.playClick();
};

// --- SET INTERCHANGE SELECTOR ---
window.switchActivePlayerSet = function(setIdx) {
  if (!playerSets[setIdx]) return;
  currentSetIndex = parseInt(setIdx);
  
  audioCtrl.playClick();
  
  // Clear currently placed players from previous set
  Object.keys(squadState).forEach(pos => {
    squadState[pos] = null;
  });
  
  // Highlight active tab
  document.querySelectorAll(".set-tab-btn").forEach((btn, idx) => {
    if (idx + 1 === currentSetIndex) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Automatically unlock the set if selected to make building immediate
  playerSets[currentSetIndex].forEach(p => unlockedPlayers.add(p.id));

  // Reset pack opener button label
  const packNameMap = {
    1: "LEGENDS PACK",
    2: "ELITES PACK",
    3: "CLASSICS PACK",
    4: "FUTURE PACK"
  };
  const packBtn = document.getElementById("open-pack-btn");
  if (packBtn) {
    packBtn.textContent = `Open ${packNameMap[currentSetIndex]}`;
  }
  
  updatePitchSlots();
  renderBench();
  calculateSquadStats();
};

// --- GAME ACTIONS HELPERS ---
window.clearActiveSquad = function() {
  audioCtrl.playClick();
  Object.keys(squadState).forEach(pos => {
    squadState[pos] = null;
  });
  updatePitchSlots();
  renderBench();
  calculateSquadStats();
};

window.autoSolveActiveSquad = function() {
  audioCtrl.playCheer();
  
  const activeSet = playerSets[currentSetIndex];
  
  // Map correct positions
  activeSet.forEach(p => {
    // If position matches, place it
    if (p.position === "GK") squadState.GK = p.id;
    if (p.position === "LB") squadState.LB = p.id;
    if (p.position === "LCB") squadState.LCB = p.id;
    if (p.position === "RCB") squadState.RCB = p.id;
    if (p.position === "RB") squadState.RB = p.id;
    if (p.position === "CDM") squadState.CDM = p.id;
    if (p.position === "LCM") squadState.LCM = p.id;
    if (p.position === "RCM") squadState.RCM = p.id;
    if (p.position === "LW") squadState.LW = p.id;
    if (p.position === "ST") squadState.ST = p.id;
    if (p.position === "RW") squadState.RW = p.id;
  });
  
  updatePitchSlots();
  renderBench();
  calculateSquadStats();
};

window.toggleSoundMute = function() {
  audioCtrl.muted = !audioCtrl.muted;
  const soundBtn = document.getElementById("sound-mute-btn");
  if (soundBtn) {
    soundBtn.textContent = audioCtrl.muted ? "🔇 Sound Off" : "🔊 Sound On";
  }
  audioCtrl.playClick();
};

// --- INITIALIZE ON DOM LOAD ---
document.addEventListener("DOMContentLoaded", () => {
  // Initialize canvas effects
  fxController = new CelebrationFX("celebration-canvas");
  
  // Populate initial components
  updatePitchSlots();
  renderBench();
  setupDropSlots();
  calculateSquadStats();
  
  // Handle click on body to clear tap selection
  document.body.addEventListener("click", () => {
    selectedBenchCardId = null;
    document.querySelectorAll(".bench-item-wrapper .fut-card").forEach(el => {
      el.classList.remove("selected-tap");
    });
  });
});
