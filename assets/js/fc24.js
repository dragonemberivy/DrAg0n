window.onerror = function(message, source, lineno, colno, error) {
  alert("Global JS Error Caught:\n" + message + "\nSource: " + source + "\nLine: " + lineno + "\nCol: " + colno);
};

/**
 * FC 24 Squad Builder & Match Center Game Logic
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

// --- REAL WORLD LOWEST RATED FC 24 BRONZE PLAYERS ---
const horriblePlayers = {
  GK: { id: "h_nasser", name: "Eyad Al Nasser", rating: 48, position: "GK", nation: "🇸🇦 Saudi Arabia", club: "Al Khaleej", cardType: "bronze-rare", stats: { div: 47, han: 48, kic: 46, ref: 48, spd: 32, pos: 45 } },
  LB: { id: "h_egel", name: "Dennis Egel", rating: 47, position: "LB", nation: "🇩🇪 Germany", club: "SV Sandhausen", cardType: "bronze-rare", stats: { pac: 60, sho: 28, pas: 35, dri: 41, def: 44, phy: 48 } },
  LCB: { id: "h_jiaqiang", name: "Lyu Jiaqiang", rating: 47, position: "LCB", nation: "🇨🇳 China", club: "Shenzhen FC", cardType: "bronze-rare", stats: { pac: 55, sho: 22, pas: 28, dri: 29, def: 48, phy: 52 } },
  RCB: { id: "h_guoliang", name: "Chen Guoliang", rating: 48, position: "RCB", nation: "🇨🇳 China", club: "Shenzhen FC", cardType: "bronze-rare", stats: { pac: 56, sho: 23, pas: 30, dri: 31, def: 49, phy: 55 } },
  RB: { id: "h_singh", name: "Abhishek Singh", rating: 48, position: "RB", nation: "🇮🇳 India", club: "Punjab FC", cardType: "bronze-rare", stats: { pac: 58, sho: 26, pas: 32, dri: 38, def: 45, phy: 49 } },
  CDM: { id: "h_sawhney", name: "Deven Sawhney", rating: 47, position: "CDM", nation: "🇮🇳 India", club: "Odisha FC", cardType: "bronze-rare", stats: { pac: 50, sho: 32, pas: 40, dri: 41, def: 46, phy: 48 } },
  LCM: { id: "h_remtluanga", name: "CVL Remtluanga", rating: 47, position: "LCM", nation: "🇮🇳 India", club: "Odisha FC", cardType: "bronze-rare", stats: { pac: 52, sho: 36, pas: 45, dri: 44, def: 42, phy: 45 } },
  RCM: { id: "h_horam", name: "Chanso Horam", rating: 48, position: "RCM", nation: "🇮🇳 India", club: "Mumbai City", cardType: "bronze-rare", stats: { pac: 64, sho: 38, pas: 42, dri: 46, def: 38, phy: 44 } },
  LW: { id: "h_chothe", name: "Sonam Chothe", rating: 48, position: "LW", nation: "🇮🇳 India", club: "Punjab FC", cardType: "bronze-rare", stats: { pac: 62, sho: 40, pas: 42, dri: 48, def: 28, phy: 46 } },
  ST: { id: "h_youzu", name: "He Youzu", rating: 48, position: "ST", nation: "🇨🇳 China", club: "Cangzhou FC", cardType: "bronze-rare", stats: { pac: 58, sho: 46, pas: 34, dri: 42, def: 25, phy: 50 } },
  RW: { id: "h_jinad", name: "Tobi Jinad", rating: 48, position: "RW", nation: "🇮🇪 Ireland", club: "Bohemians", cardType: "bronze-rare", stats: { pac: 65, sho: 41, pas: 38, dri: 44, def: 22, phy: 45 } }
};

// All players flattened into one lookup map
const allPlayersMap = {};
Object.values(playerSets).forEach(set => {
  set.forEach(p => {
    allPlayersMap[p.id] = p;
  });
});
Object.values(horriblePlayers).forEach(p => {
  allPlayersMap[p.id] = p;
});

// --- STATE MANAGEMENT ---
let currentSetIndex = 1;
let dragonbux = parseInt(localStorage.getItem("dragonbux")) || 150;
let unlockedPlayers = new Set();

// Always unlock horrible players
Object.values(horriblePlayers).forEach(p => unlockedPlayers.add(p.id));

// Load saved unlocked players
function loadUnlockedPlayers() {
  try {
    const list = JSON.parse(localStorage.getItem("unlocked_players"));
    if (list) {
      list.forEach(id => unlockedPlayers.add(id));
    }
  } catch (e) {
    console.error("Error loading unlocked players", e);
  }
}
function saveUnlockedPlayers() {
  localStorage.setItem("unlocked_players", JSON.stringify(Array.from(unlockedPlayers)));
}
loadUnlockedPlayers();

// Pre-fill starting squad with real lowest rated players
const squadState = {
  GK: "h_nasser",
  LB: "h_egel",
  LCB: "h_jiaqiang",
  RCB: "h_guoliang",
  RB: "h_singh",
  CDM: "h_sawhney",
  LCM: "h_remtluanga",
  RCM: "h_horam",
  LW: "h_chothe",
  ST: "h_youzu",
  RW: "h_jinad"
};

// Mobile tap interaction state
let selectedBenchCardId = null;

// --- AUDIO SYNTHESIZER ---
class AudioController {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.warn("Web Audio API not supported or blocked by browser policies:", e);
        this.ctx = null;
      }
    }
  }

  playClick() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      
      // Ensure context is running (fixes browser autoplay suspensions)
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      
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
    } catch (e) {
      console.warn("Could not play click audio:", e);
    }
  }

  playPlace() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {
      console.warn("Could not play placement audio:", e);
    }
  }

  playOpenPack() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      
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

      setTimeout(() => {
        if (this.muted || !this.ctx) return;
        try {
          const notes = [261.63, 329.63, 392.00, 523.25];
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
        } catch (innerErr) {
          console.warn("Could not play open pack melodies:", innerErr);
        }
      }, 1200);
    } catch (e) {
      console.warn("Could not play open pack audio:", e);
    }
  }

  playCheer() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      
      const bufferSize = this.ctx.sampleRate * 2.5;
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
    } catch (e) {
      console.warn("Could not play cheering audio:", e);
    }
  }
  
  playKick() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(80, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch (e) {
      console.warn("Could not play kick audio:", e);
    }
  }
}
const audioCtrl = new AudioController();

// --- CURRENCY WRITING ---
function updateDragonbuxDisplay() {
  localStorage.setItem("dragonbux", dragonbux);
  const el = document.getElementById("dragonbux-val");
  if (el) el.textContent = dragonbux;
}

// --- FIREWORKS ---
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
    for (let i = 0; i < 8; i++) {
      setTimeout(() => this.spawnBurst(), i * 350);
    }
    setTimeout(() => { this.active = false; }, 4500);
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
        x: x, y: y,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        alpha: 1, color: baseColor, size: Math.random() * 3 + 2,
        gravity: 0.08, friction: 0.97
      });
    }
  }
  animate() {
    if (!this.active && this.particles.length === 0) {
      if (this.ctx && this.canvas) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      return;
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.vx *= p.friction; p.vy *= p.friction; p.vy += p.gravity;
      p.x += p.vx; p.y += p.vy; p.alpha -= 0.015;
      if (p.alpha <= 0) { this.particles.splice(i, 1); continue; }
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

// --- CHEMISTRY CONNECTIONS ---
const chemLinks = [
  { from: "GK", to: "LCB" }, { from: "GK", to: "RCB" },
  { from: "LB", to: "LCB" }, { from: "LB", to: "LCM" },
  { from: "RB", to: "RCB" }, { from: "RB", to: "RCM" },
  { from: "LCB", to: "RCB" }, { from: "LCB", to: "CDM" }, { from: "RCB", to: "CDM" },
  { from: "CDM", to: "LCM" }, { from: "CDM", to: "RCM" },
  { from: "LCM", to: "LW" }, { from: "LCM", to: "ST" },
  { from: "RCM", to: "RW" }, { from: "RCM", to: "ST" },
  { from: "LW", to: "ST" }, { from: "RW", to: "ST" }
];

function calculateSquadStats() {
  let totalRating = 0;
  let filledCount = 0;
  let rawAvgRating = 0;
  let chemistry = 0;

  const placedPlayers = Object.entries(squadState)
    .filter(([pos, pId]) => pId !== null)
    .map(([pos, pId]) => ({ slotPos: pos, player: allPlayersMap[pId] }));
    
  filledCount = placedPlayers.length;
  
  if (filledCount > 0) {
    placedPlayers.forEach(item => { totalRating += item.player.rating; });
    rawAvgRating = Math.round(totalRating / 11);
  }

  const playerChemScore = {};
  
  placedPlayers.forEach(item => {
    const slot = item.slotPos;
    const p = item.player;
    
    // Horrible default team players give 0 chemistry
    if (p.id.startsWith("h_")) {
      playerChemScore[p.id] = 0;
      return;
    }
    
    const isCorrectPos = (p.position === slot);
    if (!isCorrectPos) {
      playerChemScore[p.id] = 0;
      return;
    }
    
    if (p.cardType === "icon") {
      playerChemScore[p.id] = 3;
      return;
    }
    
    let chem = 1;
    const currentSetPrefix = p.id.split("_")[0];
    const sameSetCount = placedPlayers.filter(other => other.player.id.split("_")[0] === currentSetPrefix).length;
    
    if (sameSetCount >= 8) { chem += 2; }
    else if (sameSetCount >= 5) { chem += 1; }
    
    if (chem < 3) {
      const hasNationMatch = placedPlayers.some(other => other.player.id !== p.id && other.player.nation === p.nation);
      if (hasNationMatch) chem += 1;
    }
    if (chem < 3) {
      const hasClubMatch = placedPlayers.some(other => other.player.id !== p.id && other.player.club === p.club);
      if (hasClubMatch) chem += 1;
    }
    playerChemScore[p.id] = Math.min(chem, 3);
  });
  
  placedPlayers.forEach(item => { chemistry += playerChemScore[item.player.id] || 0; });
  
  document.getElementById("avg-rating-val").textContent = rawAvgRating;
  document.getElementById("avg-rating-progress").style.width = `${(rawAvgRating / 99) * 100}%`;
  document.getElementById("chem-val").textContent = `${chemistry}/33`;
  document.getElementById("chem-progress").style.width = `${(chemistry / 33) * 100}%`;
  
  Object.keys(squadState).forEach(pos => {
    const pId = squadState[pos];
    const slotEl = document.querySelector(`.pitch-slot[data-pos="${pos}"]`);
    if (!slotEl) return;
    const chemPipContainer = slotEl.querySelector(".chem-pips");
    if (!chemPipContainer) return;
    chemPipContainer.innerHTML = "";
    
    if (pId === null) { slotEl.classList.remove("correct", "incorrect"); return; }
    
    const player = allPlayersMap[pId];
    if (player.id.startsWith("h_")) {
      slotEl.classList.remove("correct", "incorrect");
      return;
    }
    
    const score = playerChemScore[pId] || 0;
    if (player.position === pos) {
      slotEl.classList.add("correct");
      slotEl.classList.remove("incorrect");
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement("span");
        dot.className = (i < score) ? "pip active" : "pip";
        chemPipContainer.appendChild(dot);
      }
    } else {
      slotEl.classList.add("incorrect");
      slotEl.classList.remove("correct");
      const dot = document.createElement("span");
      dot.className = "pip active warning";
      chemPipContainer.appendChild(dot);
    }
  });

  drawChemistryLinks(playerChemScore);
  
  if (chemistry === 33 && filledCount === 11) {
    triggerVictoryCelebration();
  }
}

function triggerVictoryCelebration() {
  audioCtrl.playCheer();
  if (fxController) fxController.start();
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
  setTimeout(() => overlay.classList.add("show"), 10);
}

function drawChemistryLinks(playerChemScore) {
  const svg = document.getElementById("pitch-chem-svg");
  if (!svg) return;
  svg.innerHTML = "";
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
    const x1 = (fromBounds.left + fromBounds.width / 2) - pitchBounds.left;
    const y1 = (fromBounds.top + fromBounds.height / 2) - pitchBounds.top;
    const x2 = (toBounds.left + toBounds.width / 2) - pitchBounds.left;
    const y2 = (toBounds.top + toBounds.height / 2) - pitchBounds.top;
    
    const pFromId = squadState[link.from];
    const pToId = squadState[link.to];
    let lineType = "empty";
    
    if (pFromId !== null && pToId !== null) {
      const pFrom = allPlayersMap[pFromId];
      const pTo = allPlayersMap[pToId];
      
      // Bronze players don't form chemistry links
      if (!pFrom.id.startsWith("h_") && !pTo.id.startsWith("h_")) {
        const fromCorrect = (pFrom.position === link.from);
        const toCorrect = (pTo.position === link.to);
        if (fromCorrect && toCorrect) {
          const sameNation = pFrom.nation === pTo.nation;
          const sameClub = pFrom.club === pTo.club;
          const sameSet = pFrom.id.split("_")[0] === pTo.id.split("_")[0];
          if (sameSet || sameNation || sameClub || pFrom.cardType === "icon" || pTo.cardType === "icon") {
            lineType = "active";
          } else {
            lineType = "inactive";
          }
        } else {
          lineType = "inactive";
        }
      }
    }
    
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1); line.setAttribute("y1", y1);
    line.setAttribute("x2", x2); line.setAttribute("y2", y2);
    
    if (lineType === "active") {
      line.setAttribute("stroke", "#4ade80");
      line.setAttribute("stroke-width", "3.5");
      line.setAttribute("filter", "url(#glow)");
      line.style.opacity = "0.95";
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

window.addEventListener("resize", () => { calculateSquadStats(); });

// --- CARD HTML RENDERING ---
// --- SOFIFA ID MAPPING FOR REAL PICTURES ---
const playerSofifaIds = {
  // Set 1 (Legends)
  "s1_yashin": 238380,
  "s1_rcarlos": 110777,
  "s1_maldini": 110771,
  "s1_ramos": 155862,
  "s1_cafu": 10587,
  "s1_pirlo": 10574,
  "s1_ronaldinho": 2087,
  "s1_zidane": 2064,
  "s1_ronaldo": 20801,
  "s1_zlatan": 41236,
  "s1_messi": 158023,

  // Set 2 (Modern Elites)
  "s2_courtois": 192119,
  "s2_davies": 234396,
  "s2_vandijk": 203376,
  "s2_dias": 239818,
  "s2_hakimi": 235212,
  "s2_rodri": 231866,
  "s2_debruyne": 192985,
  "s2_bellingham": 252371,
  "s2_vinicius": 238794,
  "s2_haaland": 239085,
  "s2_salah": 209331,

  // Set 3 (Classic Champions)
  "s3_buffon": 1179,
  "s3_marcelo": 176676,
  "s3_puyol": 109287,
  "s3_nesta": 1088,
  "s3_zanetti": 1041,
  "s3_vieira": 1647,
  "s3_maradona": 240407,
  "s3_iniesta": 189509,
  "s3_henry": 1032,
  "s3_ronaldo": 37576,
  "s3_beckham": 1367,

  // Set 4 (Future Stars)
  "s4_donnarumma": 230621,
  "s4_balde": 263622,
  "s4_saliba": 243769,
  "s4_gvardiol": 256654,
  "s4_frimpong": 253004,
  "s4_camavinga": 248243,
  "s4_musiala": 256790,
  "s4_pedri": 251854,
  "s4_palmer": 244263,
  "s4_alvarez": 256726,
  "s4_yamal": 277016,

  // Horrible Players Fallbacks
  "h_nasser": 271223,
  "h_egel": 271228,
  "h_jiaqiang": 259600,
  "h_guoliang": 259160,
  "h_singh": 269220,
  "h_sawhney": 269300,
  "h_remtluanga": 269302,
  "h_horam": 266986,
  "h_chothe": 269221,
  "h_youzu": 212792, // Wu Lei (Correct SoFIFA ID: 212792)
  "h_jinad": 240410  // Chiedozie Ogbene (Real Irish RW face)
};

// Self-healing avatar image fallback for retired or licensing-removed players
window.handleAvatarError = function(imgElement, playerId, sofifaId) {
  const currentSrc = imgElement.src;
  
  if (currentSrc.includes("/24_120.png")) {
    imgElement.src = currentSrc.replace("/24_120.png", "/23_120.png");
  } else if (currentSrc.includes("/23_120.png")) {
    imgElement.src = currentSrc.replace("/23_120.png", "/22_120.png");
  } else if (currentSrc.includes("/22_120.png")) {
    imgElement.src = currentSrc.replace("/22_120.png", "/21_120.png");
  } else if (currentSrc.includes("/21_120.png")) {
    imgElement.src = currentSrc.replace("/21_120.png", "/20_120.png");
  } else {
    // Ultimate local asset fallbacks
    const player = allPlayersMap[playerId];
    if (player) {
      if (player.cardType === "icon") {
        imgElement.src = "assets/images/icon_player.png";
      } else if (player.cardType === "toty") {
        imgElement.src = "assets/images/toty_player.png";
      } else if (player.cardType === "future-star") {
        imgElement.src = "assets/images/future_star_player.png";
      } else {
        imgElement.src = "assets/images/bronze_player.png";
      }
    } else {
      imgElement.src = "assets/images/toty_player.png";
    }
    imgElement.onerror = null; // stop retry loop
  }
};

// --- CARD HTML RENDERING ---
function createCardHTML(p) {
  const isGK = (p.position === "GK");
  let cardThemeClass = "rare-gold";
  
  // Determine portrait image URL
  const locallyGenerated = ["h_nasser", "h_egel", "h_jiaqiang", "h_guoliang", "h_singh", "h_sawhney", "h_remtluanga", "h_horam", "h_chothe"];
  let playerPhotoUrl = "";
  
  if (locallyGenerated.includes(p.id)) {
    playerPhotoUrl = `assets/images/players/${p.id}.png`;
  } else {
    const sofifaId = playerSofifaIds[p.id];
    if (sofifaId) {
      const padded = sofifaId.toString().padStart(6, '0');
      const part1 = padded.substring(0, 3);
      const part2 = padded.substring(3, 6);
      playerPhotoUrl = `https://cdn.sofifa.net/players/${part1}/${part2}/24_120.png`;
    } else {
      // Fallback templates
      if (p.cardType === "icon") {
        playerPhotoUrl = "assets/images/icon_player.png";
      } else if (p.cardType === "toty") {
        playerPhotoUrl = "assets/images/toty_player.png";
      } else if (p.cardType === "future-star") {
        playerPhotoUrl = "assets/images/future_star_player.png";
      } else {
        playerPhotoUrl = "assets/images/bronze_player.png";
      }
    }
  }

  if (p.cardType === "icon") {
    cardThemeClass = "fut-icon";
  } else if (p.cardType === "toty") {
    cardThemeClass = "fut-toty";
  } else if (p.cardType === "future-star") {
    cardThemeClass = "fut-future-star";
  } else if (p.cardType === "bronze-rare") {
    cardThemeClass = "bronze-rare";
  }
  
  const cardIdAttr = p.id ? `id="card-${p.id}"` : '';
  const flagEmoji = p.nation.split(" ")[0];
  
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

  const sofifaIdVal = playerSofifaIds[p.id] || "null";

  return `
    <div ${cardIdAttr} class="fut-card ${cardThemeClass}" draggable="true" ondragstart="handleDragStart(event)" data-player-id="${p.id}">
      <div class="card-glow"></div>
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
      <div class="card-avatar-container">
        <img src="${playerPhotoUrl}" class="player-avatar" alt="${p.name}" referrerpolicy="no-referrer" onerror="handleAvatarError(this, '${p.id}', ${sofifaIdVal})">
      </div>
      <div class="card-name">${p.name}</div>
      <div class="card-divider"></div>
      <div class="card-stats-grid">${statsHTML}</div>
    </div>
  `;
}

// Global click handler
function handleCardClick(card, playerId) {
  audioCtrl.playClick();
  const parentSlot = card.closest(".pitch-slot");
  
  if (selectedBenchCardId) {
    if (parentSlot && selectedBenchCardId !== playerId) {
      placePlayerInSlot(selectedBenchCardId, parentSlot.dataset.pos);
      selectedBenchCardId = null;
      document.querySelectorAll(".fut-card").forEach(el => el.classList.remove("selected-tap"));
      return;
    }
  }
  
  if (selectedBenchCardId === playerId) {
    selectedBenchCardId = null;
    card.classList.remove("selected-tap");
  } else {
    selectedBenchCardId = playerId;
    document.querySelectorAll(".fut-card").forEach(el => el.classList.remove("selected-tap"));
    card.classList.add("selected-tap");
  }
}

// --- BENCH POOL LIST ---
function renderBench() {
  const bench = document.getElementById("bench-list");
  if (!bench) return;
  bench.innerHTML = "";
  
  const activeSet = playerSets[currentSetIndex];
  const placedIds = Object.values(squadState);
  const benchPlayers = activeSet.filter(p => unlockedPlayers.has(p.id) && !placedIds.includes(p.id));
  
  if (benchPlayers.length === 0) {
    bench.innerHTML = `
      <div style="grid-column: 1/-1; padding: 2rem; text-align: center; color: var(--text-gray);">
        <p>No players on bench. Open packs or swap players back here!</p>
        <span style="font-size:0.85rem; opacity:0.6;">(Unlock players from "Roster Set ${currentSetIndex}" by opening packs)</span>
      </div>`;
    return;
  }
  
  benchPlayers.forEach(p => {
    const wrapper = document.createElement("div");
    wrapper.className = "bench-item-wrapper";
    wrapper.innerHTML = createCardHTML(p);
    const card = wrapper.querySelector(".fut-card");
    card.addEventListener("click", (e) => {
      e.stopPropagation();
      handleCardClick(card, p.id);
    });
    applyCardTiltEffect(card);
    bench.appendChild(wrapper);
  });
}

function applyCardTiltEffect(card) {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2; const yc = rect.height / 2;
    const angleX = (yc - y) / 10; const angleY = (x - xc) / 10;
    card.style.transform = `perspective(500px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale(1.03)`;
    const glow = card.querySelector(".card-glow");
    if (glow) {
      glow.style.background = `radial-gradient(circle at ${(x / rect.width) * 100}% ${(y / rect.height) * 100}%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 60%)`;
    }
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "perspective(500px) rotateX(0deg) rotateY(0deg) scale(1)";
    const glow = card.querySelector(".card-glow");
    if (glow) glow.style.background = "none";
  });
}

// --- DRAG AND DROP ---
window.handleDragStart = function(ev) {
  ev.dataTransfer.setData("text/plain", ev.target.dataset.playerId);
  ev.dataTransfer.effectAllowed = "move";
  ev.target.classList.add("dragging");
  audioCtrl.playClick();
};

document.addEventListener("dragend", (ev) => {
  if (ev.target.classList) ev.target.classList.remove("dragging");
});

function setupDropSlots() {
  const slots = document.querySelectorAll(".pitch-slot");
  slots.forEach(slot => {
    slot.addEventListener("dragover", (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; });
    slot.addEventListener("dragenter", (e) => { e.preventDefault(); slot.classList.add("drag-hover"); });
    slot.addEventListener("dragleave", () => { slot.classList.remove("drag-hover"); });
    slot.addEventListener("drop", (e) => {
      e.preventDefault();
      slot.classList.remove("drag-hover");
      const playerId = e.dataTransfer.getData("text/plain");
      placePlayerInSlot(playerId, slot.dataset.pos);
    });
    slot.addEventListener("click", (e) => {
      const pos = slot.dataset.pos;
      if (selectedBenchCardId) {
        e.stopPropagation();
        placePlayerInSlot(selectedBenchCardId, pos);
        selectedBenchCardId = null;
        document.querySelectorAll(".fut-card").forEach(el => el.classList.remove("selected-tap"));
      }
    });
  });
  
  const bench = document.getElementById("bench-list");
  if (bench) {
    bench.addEventListener("dragover", (e) => { e.preventDefault(); });
    bench.addEventListener("drop", (e) => {
      e.preventDefault();
      const playerId = e.dataTransfer.getData("text/plain");
      const originPos = Object.keys(squadState).find(key => squadState[key] === playerId);
      if (originPos) removePlayerFromSlot(originPos);
    });
  }
}

function placePlayerInSlot(playerId, targetPos) {
  if (!playerId || !targetPos) return;
  const playerObj = allPlayersMap[playerId];
  if (!playerObj) return;

  if (!unlockedPlayers.has(playerId)) {
    alert("You must unlock this player first!");
    return;
  }
  
  const currentSlot = Object.keys(squadState).find(key => squadState[key] === playerId);
  const displacedPlayerId = squadState[targetPos];
  
  if (currentSlot) {
    squadState[currentSlot] = displacedPlayerId;
  }
  
  squadState[targetPos] = playerId;
  
  updatePitchSlots();
  renderBench();
  calculateSquadStats();
  audioCtrl.playPlace();
}

function removePlayerFromSlot(pos) {
  if (squadState[pos] === null) return;
  const pId = squadState[pos];
  
  // Restore real world lowest rated placeholder
  const defaultBronze = Object.values(horriblePlayers).find(p => p.position === pos);
  squadState[pos] = defaultBronze ? defaultBronze.id : null;
  
  updatePitchSlots();
  renderBench();
  calculateSquadStats();
  audioCtrl.playClick();
}

function updatePitchSlots() {
  Object.keys(squadState).forEach(pos => {
    const pId = squadState[pos];
    const slotEl = document.querySelector(`.pitch-slot[data-pos="${pos}"]`);
    if (!slotEl) return;
    const cardTarget = slotEl.querySelector(".slot-card-target");
    if (!cardTarget) return;
    
    if (pId === null) {
      cardTarget.innerHTML = `<div class="empty-card-outline"><div class="pos-badge">${pos}</div><div class="plus-icon">+</div></div>`;
      slotEl.classList.remove("filled");
    } else {
      const player = allPlayersMap[pId];
      cardTarget.innerHTML = createCardHTML(player);
      const card = cardTarget.querySelector(".fut-card");
      card.addEventListener("dragstart", (e) => { e.dataTransfer.setData("text/plain", pId); });
      card.addEventListener("click", (e) => {
        e.stopPropagation();
        handleCardClick(card, pId);
      });
      applyCardTiltEffect(card);
      slotEl.classList.add("filled");
    }
  });
}

// --- PACK REVEAL SINGLE-CARD LOOT SYSTEM ---
window.openPack = function() {
  if (dragonbux < 100) {
    alert("Insufficient Dragonbux! You need 100 🪙 to open a pack. Play matches to earn more.");
    return;
  }

  const activeSet = playerSets[currentSetIndex];
  const lockedInSet = activeSet.filter(p => !unlockedPlayers.has(p.id));
  
  if (lockedInSet.length === 0) {
    alert(`All players in Roster Set ${currentSetIndex} are already unlocked! Switch active sets to unlock others.`);
    return;
  }

  dragonbux -= 100;
  updateDragonbuxDisplay();

  const randomIndex = Math.floor(Math.random() * lockedInSet.length);
  const drawnPlayer = lockedInSet[randomIndex];
  
  unlockedPlayers.add(drawnPlayer.id);
  saveUnlockedPlayers();
  
  audioCtrl.playOpenPack();

  const packOpenSect = document.getElementById("pack-reveal-screen");
  if (!packOpenSect) return;
  packOpenSect.style.display = "flex";
  packOpenSect.innerHTML = `
    <div class="pack-opening-container">
      <div class="pack-wrapper-animated" id="pack-wrapper-anim">
        <div class="gold-pack-ribbon"></div>
        <div class="pack-face">
          <div class="logo-fut">FC 24</div>
          <div class="pack-name-txt">SINGLE PLAYER REVEAL</div>
          <div style="font-size:0.9rem; color:#a855f7; margin-top:20px; font-weight:800;">100 DB PAID</div>
        </div>
      </div>
      <div id="walkout-stage" class="walkout-stage-hidden"></div>
    </div>
  `;

  const packWrapper = document.getElementById("pack-wrapper-anim");
  packWrapper.addEventListener("click", () => {
    packWrapper.classList.add("rip-open");
    setTimeout(() => {
      triggerWalkoutReveal(drawnPlayer);
    }, 1200);
  });
};

function triggerWalkoutReveal(player) {
  const walkoutStage = document.getElementById("walkout-stage");
  const packWrapper = document.getElementById("pack-wrapper-anim");
  if (!walkoutStage) return;
  if (packWrapper) packWrapper.style.display = "none";
  
  walkoutStage.className = "walkout-stage-visible";
  
  walkoutStage.innerHTML = `
    <div class="walkout-flares"></div>
    <div class="walkout-stats-reveal" id="walkout-stats-item">
      <div style="font-size: 1.5rem; color: #fbbf24;">${player.cardType.toUpperCase()}</div>
      <div class="stat-reveal-line" style="--d:0.2s">RATING: ${player.rating}</div>
      <div class="stat-reveal-line" style="--d:0.4s">POS: ${player.position}</div>
      <div class="stat-reveal-line" style="--d:0.6s">NATION: ${player.nation}</div>
      <div class="stat-reveal-line" style="--d:0.8s">CLUB: ${player.club}</div>
    </div>
    
    <div class="walkout-card-holder" id="walkout-card-item">
      ${createCardHTML(player)}
    </div>
    
    <div class="walkout-pack-contents-drawer reveal" id="pack-drawer">
      <h3 style="color:#fff; text-shadow:0 0 10px rgba(0,0,0,0.5); font-style:italic;">🎉 PLAYER UNLOCKED!</h3>
      <p style="font-size:0.9rem; color:var(--text-gray); margin-top:5px;">This player has been sent to your bench collection pool.</p>
      <button onclick="closePackReveal()" style="margin-top:1.5rem; width:220px;">Send to Bench</button>
    </div>
  `;

  setTimeout(() => {
    const statsItem = document.getElementById("walkout-stats-item");
    const cardItem = document.getElementById("walkout-card-item");
    if (statsItem) statsItem.classList.add("reveal");
    if (cardItem) cardItem.classList.add("reveal");
  }, 100);
}

window.closePackReveal = function() {
  const packOpenSect = document.getElementById("pack-reveal-screen");
  if (packOpenSect) packOpenSect.style.display = "none";
  audioCtrl.playClick();
  renderBench();
  calculateSquadStats();
};

// --- SET INTERCHANGE SELECTOR ---
window.switchActivePlayerSet = function(setIdx) {
  if (!playerSets[setIdx]) return;
  currentSetIndex = parseInt(setIdx);
  audioCtrl.playClick();
  
  document.querySelectorAll(".set-tab-btn").forEach((btn, idx) => {
    if (idx + 1 === currentSetIndex) btn.classList.add("active");
    else btn.classList.remove("active");
  });

  const packNameMap = { 1: "LEGENDS PACK", 2: "ELITES PACK", 3: "CLASSICS PACK", 4: "FUTURE PACK" };
  const packBtn = document.getElementById("open-pack-btn");
  if (packBtn) packBtn.textContent = `Open ${packNameMap[currentSetIndex]} (100 DB)`;
  
  renderBench();
  calculateSquadStats();
};

window.clearActiveSquad = function() {
  audioCtrl.playClick();
  Object.keys(squadState).forEach(pos => {
    const defaultBronze = Object.values(horriblePlayers).find(p => p.position === pos);
    squadState[pos] = defaultBronze ? defaultBronze.id : null;
  });
  updatePitchSlots();
  renderBench();
  calculateSquadStats();
};

window.autoSolveActiveSquad = function() {
  audioCtrl.playCheer();
  const activeSet = playerSets[currentSetIndex];
  activeSet.forEach(p => {
    if (unlockedPlayers.has(p.id)) {
      squadState[p.position] = p.id;
    }
  });
  updatePitchSlots();
  renderBench();
  calculateSquadStats();
};

window.toggleSoundMute = function() {
  audioCtrl.muted = !audioCtrl.muted;
  const soundBtn = document.getElementById("sound-mute-btn");
  if (soundBtn) soundBtn.textContent = audioCtrl.muted ? "🔇 Sound Off" : "🔊 Sound On";
  audioCtrl.playClick();
};

// --- MATCH SIMULATOR & PLAYABLE 2D SOCCER GAME ---
let matchTickerInterval = null;
let matchMinute = 0;
let homeScore = 0;
let awayScore = 0;
let currentOpponent = "";
let animationFrameId = null;
let canvas = null;
let ctx = null;

// Game State Variables
let gameActive = false;
let matchTimerSeconds = 0; // 60 seconds total match time (1s = 1.5 virtual match minutes)
let controlledPlayerIndex = 0; // Index of player we control (blue circle)

// Keyboard Controls State
const keysPressed = {};

// Game Entities
let ball = {
  x: 325, y: 200,
  vx: 0, vy: 0,
  radius: 6,
  owner: null, // null, or player object
  lastOwner: null,
  tackleCooldown: 0
};

// Players and Opponent arrays
let homePlayers = []; // Your 4-3-3 squad on the pitch
let opponentPlayers = []; // AI Opponents (Red)
let opponentGoalkeeper = { x: 625, y: 200, radius: 10, targetY: 200, speed: 2 };

// 4-3-3 Pitch Coordinates (Attacking left to right)
const baseCoordinates433 = {
  GK: { x: 45, y: 200 },
  LB: { x: 180, y: 80 },
  LCB: { x: 160, y: 160 },
  RCB: { x: 160, y: 240 },
  RB: { x: 180, y: 320 },
  CDM: { x: 300, y: 200 },
  LCM: { x: 330, y: 120 },
  RCM: { x: 330, y: 280 },
  LW: { x: 480, y: 80 },
  ST: { x: 500, y: 200 },
  RW: { x: 480, y: 320 }
};

// Key event listeners
window.addEventListener("keydown", (e) => {
  keysPressed[e.key.toLowerCase()] = true;
  // Prevent spacebar or arrow keys from scrolling the webpage while in game
  if (["space", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }
});
window.addEventListener("keyup", (e) => {
  keysPressed[e.key.toLowerCase()] = false;
});

window.openMatchCenter = function() {
  try {
    audioCtrl.playClick();
    
    const overlay = document.getElementById("match-center-overlay");
    if (!overlay) throw new Error("match-center-overlay element is missing in HTML");
    overlay.style.display = "flex";
    
    // Add the class list to fade in and activate pointer events
    setTimeout(() => {
      overlay.classList.add("show");
    }, 10);
    
    const closeBtn = document.getElementById("close-match-btn");
    if (!closeBtn) throw new Error("close-match-btn element is missing in HTML");
    closeBtn.style.display = "none";
    
    const startBtn = document.getElementById("start-match-btn");
    if (!startBtn) throw new Error("start-match-btn element is missing in HTML");
    startBtn.style.display = "inline-block";
    
    const score = document.getElementById("match-score");
    if (!score) throw new Error("match-score element is missing in HTML");
    score.textContent = "0 - 0";
    
    homeScore = 0; awayScore = 0; matchMinute = 0;
    const opponents = ["Galacticos FC", "Red Devils", "Sky Blues", "El Blaugrana", "Piemonte Calcio"];
    currentOpponent = opponents[Math.floor(Math.random() * opponents.length)];
    
    const awayTeam = document.getElementById("match-away-team");
    if (!awayTeam) throw new Error("match-away-team element is missing in HTML");
    awayTeam.textContent = currentOpponent;
    
    // Initialize Canvas context
    canvas = document.getElementById("penalty-canvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    
    canvas.width = 650;
    canvas.height = 400;
    
    // Render starting static pitch and start the rendering loop
    initializeGameplayEntities();
    cancelAnimationFrame(animationFrameId);
    gameTick();
  } catch (err) {
    alert("Error opening Match Center: " + err.message + "\n\nIf you have edited the HTML, please ensure all match overlay elements exist.");
    console.error(err);
  }
};

window.closeMatchCenter = function() {
  audioCtrl.playClick();
  gameActive = false;
  clearInterval(matchTickerInterval);
  cancelAnimationFrame(animationFrameId);
  if (canvas) {
    canvas.removeEventListener("click", handlePitchCanvasClick);
  }
  
  const overlay = document.getElementById("match-center-overlay");
  if (overlay) {
    overlay.classList.remove("show");
    setTimeout(() => {
      overlay.style.display = "none";
    }, 500); // Wait for transition fade out to complete
  }
  calculateSquadStats();
};

window.startSimulatedMatch = function() {
  document.getElementById("start-match-btn").style.display = "none";
  
  gameActive = true;
  initializeGameplayEntities();
  startMatchTimer();
  
  // Bind canvas click event for passing/shooting
  canvas.addEventListener("click", handlePitchCanvasClick);
};

function startMatchTimer() {
  matchTimerSeconds = 60; // 60 seconds total match time
  updateTimerDisplay();
  
  matchTickerInterval = setInterval(() => {
    matchTimerSeconds--;
    
    // 60 seconds is 90 virtual minutes (1s = 1.5m)
    matchMinute = Math.round((60 - matchTimerSeconds) * 1.5);
    if (matchMinute > 90) matchMinute = 90;
    
    updateTimerDisplay();
    
    if (matchTimerSeconds <= 0) {
      clearInterval(matchTickerInterval);
      endGameplayMatch();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const display = document.getElementById("match-timer-display");
  if (!display) return;
  const mins = Math.floor(matchTimerSeconds / 60);
  const secs = matchTimerSeconds % 60;
  const padSecs = secs.toString().padStart(2, '0');
  display.textContent = `TIME: ${mins}:${padSecs} (${matchMinute}')`;
}

function getPlayerColorByCardType(cardType) {
  if (cardType === "icon") return "#d4af37"; // Icons get classic gold skins
  if (cardType === "toty") return "#1e3a8a"; // Blue TOTY
  if (cardType === "future-star") return "#db2777"; // Star Pink
  if (cardType === "bronze-rare") return "#cd7f32"; // Bronze
  return "#e2e8f0";
}

function initializeGameplayEntities() {
  const avgRatingEl = document.getElementById("avg-rating-val");
  const currentOvr = avgRatingEl ? (parseInt(avgRatingEl.textContent) || 45) : 45;
  
  // 1. Populate players based on active 4-3-3 squad builder cards
  homePlayers = [];
  Object.entries(squadState).forEach(([pos, pId]) => {
    if (pId) {
      const playerObj = allPlayersMap[pId];
      if (playerObj) {
        // Retrieve stats or default to OVR rating
        const pace = playerObj.stats.pac || playerObj.stats.spd || playerObj.rating;
        const shooting = playerObj.stats.sho || playerObj.stats.div || playerObj.rating;
        const passing = playerObj.stats.pas || playerObj.stats.kic || playerObj.rating;
        
        // Base coordinate mapping
        const baseCoords = baseCoordinates433[pos] || { x: 300, y: 200 };
        
        homePlayers.push({
          id: pId,
          name: playerObj.name,
          rating: playerObj.rating,
          position: pos,
          cardType: playerObj.cardType,
          x: baseCoords.x,
          y: baseCoords.y,
          targetX: baseCoords.x,
          targetY: baseCoords.y,
          radius: 12,
          color: getPlayerColorByCardType(playerObj.cardType),
          stats: { pace, shooting, passing }
        });
      }
    }
  });

  // Default control to Striker (ST) or first teammate
  controlledPlayerIndex = homePlayers.findIndex(p => p.position === "ST");
  if (controlledPlayerIndex === -1) controlledPlayerIndex = 0;
  
  if (homePlayers[controlledPlayerIndex]) {
    // Spawn ball at player feet
    ball.x = homePlayers[controlledPlayerIndex].x + 14;
    ball.y = homePlayers[controlledPlayerIndex].y;
    ball.owner = homePlayers[controlledPlayerIndex];
  }

  // 2. Initialize Opponent AI players (Red circles)
  opponentPlayers = [
    { x: 380, y: 140, baseSpeed: 1.1, targetX: 380, targetY: 140, radius: 11 },
    { x: 380, y: 260, baseSpeed: 1.1, targetX: 380, targetY: 260, radius: 11 },
    { x: 480, y: 120, baseSpeed: 1.4, targetX: 480, targetY: 120, radius: 11 },
    { x: 480, y: 280, baseSpeed: 1.4, targetX: 480, targetY: 280, radius: 11 }
  ];

  opponentGoalkeeper = {
    x: 625,
    y: 200,
    radius: 12,
    targetY: 200,
    speed: 1.1 + (currentOvr - 45) * 0.015 // Goalkeeper matches the team rating's pace slightly
  };

  // Reset ball velocities
  ball.vx = 0;
  ball.vy = 0;
  ball.tackleCooldown = 0;
  ball.lastOwner = null;
}

function updateGameplayLoop() {
  if (!gameActive) return;

  // 1. Move the controlled player circle
  const player = homePlayers[controlledPlayerIndex];
  if (player) {
    let dx = 0;
    let dy = 0;
    
    if (keysPressed["w"] || keysPressed["arrowup"]) dy = -1;
    if (keysPressed["s"] || keysPressed["arrowdown"]) dy = 1;
    if (keysPressed["a"] || keysPressed["arrowleft"]) dx = -1;
    if (keysPressed["d"] || keysPressed["arrowright"]) dx = 1;
    
    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }
    
    // Pace determines speed: OVR maps to speed 1.7 to 4.0
    const speed = 1.7 + (player.stats.pace / 100) * 2.3;
    player.x += dx * speed;
    player.y += dy * speed;
    
    // Pitch bounds checking
    player.x = Math.max(25, Math.min(625, player.x));
    player.y = Math.max(25, Math.min(375, player.y));
  }

  // 2. Ball physics (tackles, rolling, friction)
  if (ball.tackleCooldown > 0) ball.tackleCooldown--;

  if (ball.owner) {
    ball.x = ball.owner.x + 10;
    ball.y = ball.owner.y;
    ball.vx = 0;
    ball.vy = 0;
  } else {
    ball.x += ball.vx;
    ball.y += ball.vy;
    ball.vx *= 0.96; // Grass rolling friction
    ball.vy *= 0.96;
    
    // Wall bounds rebounds
    if (ball.y <= 20 || ball.y >= 380) {
      ball.vy = -ball.vy * 0.7;
      ball.y = Math.max(20, Math.min(380, ball.y));
    }
    
    // Check Goal Line (x >= 635, between y: 145 and 255)
    if (ball.x >= 630 && ball.y >= 145 && ball.y <= 255) {
      triggerGoalScored(true); // GOAL!
    } else if (ball.x <= 20 && ball.y >= 145 && ball.y <= 255) {
      triggerGoalScored(false); // Conceded goal
    } else {
      // Rebounds off backlines
      if (ball.x <= 20) {
        ball.vx = -ball.vx * 0.7;
        ball.x = 20;
      }
      if (ball.x >= 630) {
        ball.vx = -ball.vx * 0.7;
        ball.x = 630;
      }
    }
  }

  // 3. Keep other teammates floating back toward formation slots
  homePlayers.forEach((p, idx) => {
    if (idx === controlledPlayerIndex) return;
    const dx = p.targetX - p.x;
    const dy = p.targetY - p.y;
    p.x += dx * 0.04;
    p.y += dy * 0.04;
  });

  // 4. Opponent defender AI (runs towards player with ball to tackle, else retreats)
  opponentPlayers.forEach(op => {
    if (ball.owner && !ball.owner.id.startsWith("opponent_")) {
      const dx = ball.owner.x - op.x;
      const dy = ball.owner.y - op.y;
      const dist = Math.hypot(dx, dy);
      
      if (dist > 5) {
        op.x += (dx / dist) * op.baseSpeed;
        op.y += (dy / dist) * op.baseSpeed;
      }
      
      // Perform tackle collision
      if (dist < (op.radius + ball.owner.radius) && ball.tackleCooldown === 0) {
        ball.owner = null;
        ball.vx = -4.5 - Math.random() * 2.5; // Clear the ball leftwards
        ball.vy = Math.random() * 4 - 2;
        ball.tackleCooldown = 30; // 30 tick recovery before player can reclaim
        audioCtrl.playKick();
        
        const msg = document.getElementById("shootout-message");
        if (msg) {
          msg.style.display = "block";
          msg.style.color = "#ef4444";
          msg.textContent = "TACKLED! ⚔️";
          setTimeout(() => { msg.style.display = "none"; }, 800);
        }
      }
    } else {
      // Return to baseline coordinates
      const dx = op.targetX - op.x;
      const dy = op.targetY - op.y;
      op.x += dx * 0.03;
      op.y += dy * 0.03;
      
      // Kick loose balls away
      const ballDist = Math.hypot(ball.x - op.x, ball.y - op.y);
      if (ballDist < (op.radius + ball.radius) && ball.tackleCooldown === 0) {
        ball.vx = -5.5 - Math.random() * 3;
        ball.vy = Math.random() * 5 - 2.5;
        ball.tackleCooldown = 40;
        audioCtrl.playKick();
      }
    }
  });

  // 5. Opponent Goalkeeper AI (tracks ball Y coord on the goal line)
  if (opponentGoalkeeper) {
    const gk = opponentGoalkeeper;
    const targetY = Math.max(160, Math.min(240, ball.y));
    const dy = targetY - gk.y;
    gk.y += Math.sign(dy) * Math.min(Math.abs(dy), gk.speed);
    
    // Save block collision
    const ballGkDist = Math.hypot(ball.x - gk.x, ball.y - gk.y);
    if (ballGkDist < (gk.radius + ball.radius) && !ball.owner) {
      ball.vx = -7 - Math.random() * 4;
      ball.vy = Math.random() * 6 - 3;
      audioCtrl.playKick();
      
      const msg = document.getElementById("shootout-message");
      if (msg) {
        msg.style.display = "block";
        msg.style.color = "#fbbf24";
        msg.textContent = "SAVED! 🧤";
        setTimeout(() => { msg.style.display = "none"; }, 800);
      }
    }
  }

  // 6. Claim loose balls
  if (!ball.owner && ball.tackleCooldown === 0) {
    homePlayers.forEach((p, idx) => {
      const dist = Math.hypot(ball.x - p.x, ball.y - p.y);
      if (dist < (p.radius + ball.radius)) {
        ball.owner = p;
        controlledPlayerIndex = idx;
        audioCtrl.playPlace();
      }
    });
  }
}

function drawPitchLoop() {
  if (!ctx) return;
  try {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Field Grass (Dark Green)
    ctx.fillStyle = "#1e4620";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grass stripes (alternating greens)
    ctx.fillStyle = "#224f24";
    for (let x = 0; x < canvas.width; x += 50) {
      if ((x / 50) % 2 === 0) {
        ctx.fillRect(x, 0, 25, canvas.height);
      }
    }
    
    // Draw Pitch Markings (White)
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;
    
    // Boundary line
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
    
    // Center line
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 20);
    ctx.lineTo(canvas.width / 2, canvas.height - 20);
    ctx.stroke();
    
    // Center circle
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
    ctx.stroke();
    
    // Center spot
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Penalty boxes
    // Left box
    ctx.strokeRect(20, 100, 80, 200);
    // Right box
    ctx.strokeRect(canvas.width - 100, 100, 80, 200);
    
    // Penalty Spots
    ctx.beginPath();
    ctx.arc(70, 200, 2.5, 0, Math.PI * 2);
    ctx.arc(canvas.width - 70, 200, 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw Goal Nets (left and right)
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(5, 145, 15, 110);
    ctx.fillRect(canvas.width - 20, 145, 15, 110);
    
    // Goal lines frame
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    // left goalposts
    ctx.moveTo(20, 145); ctx.lineTo(5, 145); ctx.lineTo(5, 255); ctx.lineTo(20, 255);
    // right goalposts
    ctx.moveTo(canvas.width - 20, 145); ctx.lineTo(canvas.width - 5, 145); ctx.lineTo(canvas.width - 5, 255); ctx.lineTo(canvas.width - 20, 255);
    ctx.stroke();

    // Draw Opponent AI defenders (Red Circles)
    opponentPlayers.forEach(op => {
      ctx.fillStyle = "#ef4444"; // red
      ctx.strokeStyle = "#991b1b";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(op.x, op.y, op.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // Draw Opponent Goalkeeper (Dark Red)
    if (opponentGoalkeeper) {
      ctx.fillStyle = "#7f1d1d";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(opponentGoalkeeper.x, opponentGoalkeeper.y, opponentGoalkeeper.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 8px Outfit";
      ctx.fillText("GK", opponentGoalkeeper.x - 5, opponentGoalkeeper.y + 3);
    }

    // Draw Teammates (Blue/Gold/Pink based on cardType)
    homePlayers.forEach((p, idx) => {
      ctx.fillStyle = p.color;
      ctx.strokeStyle = (idx === controlledPlayerIndex) ? "#38bdf8" : "rgba(255,255,255,0.45)";
      ctx.lineWidth = (idx === controlledPlayerIndex) ? 3.5 : 2.0;
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Draw controlled ring highlight indicator
      if (idx === controlledPlayerIndex) {
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw position labels on circles
      ctx.fillStyle = (p.color === "#d4af37" || p.color === "#e2e8f0") ? "#000000" : "#ffffff";
      ctx.font = "bold 9px Outfit";
      ctx.fillText(p.position, p.x - 6, p.y + 3);
    });

    // Draw Ball shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.arc(ball.x + 2, ball.y + 3, ball.radius - 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Draw Ball
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Draw ball center dot
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
  } catch (e) {
    console.warn("Error drawing pitch scene:", e);
  }
}

function handlePitchCanvasClick(e) {
  if (!gameActive || !ball.owner) return;
  
  const rect = canvas.getBoundingClientRect();
  const clickX = ((e.clientX - rect.left) / rect.width) * canvas.width;
  const clickY = ((e.clientY - rect.top) / rect.height) * canvas.height;
  
  const player = ball.owner;
  
  // Shoot vs Pass determination
  if (clickX >= 480 && player.x >= 325) {
    // SHOOT AT GOAL
    audioCtrl.playKick();
    
    const dx = clickX - player.x;
    const dy = clickY - player.y;
    const dist = Math.hypot(dx, dy);
    
    // Shooting stat dictates shot speed: maps OVR rating to 5.5 - 12.0
    const velocity = 5.5 + (player.stats.shooting / 100) * 6.5;
    
    ball.owner = null;
    ball.vx = (dx / dist) * velocity;
    ball.vy = (dy / dist) * velocity;
    ball.tackleCooldown = 25;
    
    const msg = document.getElementById("shootout-message");
    if (msg) {
      msg.style.display = "block";
      msg.style.color = "#38bdf8";
      msg.textContent = "SHOT! ⚡";
      setTimeout(() => { msg.style.display = "none"; }, 800);
    }
  } else {
    // PASS TO TEAMMATE
    let closestTeammateIndex = -1;
    let minDist = Infinity;
    
    homePlayers.forEach((p, idx) => {
      if (idx === controlledPlayerIndex) return;
      const dist = Math.hypot(clickX - p.x, clickY - p.y);
      if (dist < minDist) {
        minDist = dist;
        closestTeammateIndex = idx;
      }
    });
    
    if (closestTeammateIndex !== -1 && minDist < 150) {
      audioCtrl.playPlace();
      const targetTeammate = homePlayers[closestTeammateIndex];
      
      const dx = targetTeammate.x - player.x;
      const dy = targetTeammate.y - player.y;
      
      // Passing accuracy scaling: lower passing rating adds random drift angles
      const passAccuracy = player.stats.passing;
      const drift = (100 - passAccuracy) * 0.15;
      const angleOffset = (Math.random() * 2 - 1) * drift * (Math.PI / 180);
      
      const angle = Math.atan2(dy, dx) + angleOffset;
      const passSpeed = 6.0;
      
      ball.owner = null;
      ball.vx = Math.cos(angle) * passSpeed;
      ball.vy = Math.sin(angle) * passSpeed;
      ball.tackleCooldown = 15;
      
      // Switch controlled highlights immediately to allow receiving actions
      controlledPlayerIndex = closestTeammateIndex;
    }
  }
}

function gameTick() {
  if (gameActive) {
    updateGameplayLoop();
  }
  drawPitchLoop();
  if (canvas) {
    animationFrameId = requestAnimationFrame(gameTick);
  }
}

function triggerGoalScored(byPlayer) {
  ball.owner = null;
  ball.vx = 0;
  ball.vy = 0;
  ball.tackleCooldown = 60; // 60 ticks before reclaiming
  
  audioCtrl.playCheer();
  
  const msg = document.getElementById("shootout-message");
  if (msg) {
    msg.style.display = "block";
    if (byPlayer) {
      homeScore++;
      msg.style.color = "#4ade80";
      msg.textContent = "GOAL!!! ⚽🏆";
    } else {
      awayScore++;
      msg.style.color = "#ef4444";
      msg.textContent = "CONCEDED! ❌";
    }
    document.getElementById("match-score").textContent = `${homeScore} - ${awayScore}`;
    setTimeout(() => {
      msg.style.display = "none";
      // Reposition ball at center and reset coordinates
      initializeGameplayEntities();
    }, 2000);
  }
}

function endGameplayMatch() {
  gameActive = false;
  cancelAnimationFrame(animationFrameId);
  if (canvas) {
    canvas.removeEventListener("click", handlePitchCanvasClick);
  }
  
  audioCtrl.playCheer();
  
  let resultReward = 50;
  let resultText = "LOSS";
  let color = "#ef4444";
  
  if (homeScore > awayScore) {
    resultReward = 120;
    resultText = "VICTORY";
    color = "#4ade80";
  } else if (homeScore === awayScore) {
    resultReward = 80;
    resultText = "DRAW";
    color = "#fbbf24";
  }
  
  const goalBonus = homeScore * 10;
  const totalPayout = resultReward + goalBonus;
  
  dragonbux += totalPayout;
  updateDragonbuxDisplay();
  
  const msg = document.getElementById("shootout-message");
  if (msg) {
    msg.style.display = "block";
    msg.style.color = color;
    msg.innerHTML = `MATCH ENDED!<br>RESULT: ${resultText}<br>Earned: ${totalPayout} DB`;
  }
  
  document.getElementById("close-match-btn").style.display = "inline-block";
}

function endSimulatedMatch() {
  clearInterval(matchTickerInterval);
  cancelAnimationFrame(animationFrameId);
  addCommentaryEntry("90'", "Referee blows the final whistle! Full time.", "#fbbf24");
  
  let resultReward = 50;
  let resultText = "LOSS";
  let color = "#ef4444";
  
  if (homeScore > awayScore) {
    resultReward = 120;
    resultText = "VICTORY";
    color = "#4ade80";
    audioCtrl.playCheer();
  } else if (homeScore === awayScore) {
    resultReward = 80;
    resultText = "DRAW";
    color = "#fbbf24";
  }
  
  const goalBonus = homeScore * 10;
  const totalPayout = resultReward + goalBonus;
  
  dragonbux += totalPayout;
  updateDragonbuxDisplay();
  
  addCommentaryEntry("END", `MATCH RESULT: ${resultText}! Earned: ${resultReward} DB + ${goalBonus} DB Goal Bonus = ${totalPayout} DB!`, color);
  document.getElementById("close-match-btn").style.display = "inline-block";
}

// --- INITIALIZE ON DOM LOAD ---
document.addEventListener("DOMContentLoaded", () => {
  fxController = new CelebrationFX("celebration-canvas");
  updateDragonbuxDisplay();
  updatePitchSlots();
  renderBench();
  setupDropSlots();
  calculateSquadStats();
  
  document.body.addEventListener("click", () => {
    selectedBenchCardId = null;
    document.querySelectorAll(".bench-item-wrapper .fut-card").forEach(el => {
      el.classList.remove("selected-tap");
    });
  });
});
