/* AETHER SIEGE: GUARDIANS OF THE REALM (2026 ADVANCED AUTO-BATTLER ENGINE) */
(function() {
  const CANVAS_WIDTH = 540;
  const CANVAS_HEIGHT = 680;
  const UNLOCK_COST_DC = 150; // Cost to unlock locked guardians

  // 18 UNIQUE UNIT ARCHETYPES WITH AUTHENTIC ABILITIES
  const UNIT_ARCHETYPES = {
    BLADEDANCER: {
      name: 'Blade Dancer',
      icon: '💃',
      color: '#38bdf8',
      damage: 65,
      speed: 700,
      range: 220,
      type: 'blade',
      spriteKey: 'HERO_BLADEDANCER',
      role: 'Dance DPS',
      desc: 'Enters Dance Mode (+180% DMG, 2.5x Speed) when NOT adjacent to any other Blade Dancer!',
      mechanic: 'Check orthogonal neighbors. If isolated from other BDs, activates spinning blades.'
    },
    DEMONHUNTER: {
      name: 'Demon Hunter',
      icon: '👿',
      color: '#a855f7',
      damage: 55,
      speed: 800,
      range: 240,
      type: 'demon',
      spriteKey: 'HERO_DEMONHUNTER',
      role: 'Scaling DPS',
      desc: 'Powers up from total DH tiers on board: 10+ tiers = 2 targets, 20+ = 3 targets, 40+ = Apex Laser!',
      mechanic: 'Counts total sum of DH merge ranks on board to unlock multi-target and Transcendence.'
    },
    HARLEQUIN: {
      name: 'Harlequin',
      icon: '🎭',
      color: '#f43f5e',
      damage: 35,
      speed: 950,
      range: 200,
      type: 'clone',
      spriteKey: 'HERO_HARLEQUIN',
      role: 'Merge Support',
      desc: 'Universal Copy! Merge with ANY unit of the same rank to become an exact duplicate of it!',
      mechanic: 'Universal merge: transforms into copy of target unit at current rank.'
    },
    DRYAD: {
      name: 'Dryad',
      icon: '🌿',
      color: '#10b981',
      damage: 30,
      speed: 1000,
      range: 200,
      type: 'growth',
      spriteKey: 'HERO_DRYAD',
      role: 'Rank Up Support',
      desc: 'Direct Growth! Merge with ANY unit of the same rank to upgrade that unit rank by +1 directly!',
      mechanic: 'Universal merge: increases target unit rank +1 without changing its archetype.'
    },
    SCRAPPER: {
      name: 'Scrapper',
      icon: '⚙️',
      color: '#f59e0b',
      damage: 40,
      speed: 900,
      range: 190,
      type: 'scrap',
      spriteKey: 'HERO_SCRAPPER',
      role: 'Recycle Support',
      desc: 'Devours extra units of equal/lower rank to generate Aether and grant random board rank-ups!',
      mechanic: 'Consumes target unit on merge. Every 3 scraps grants +1 rank to a random ally.'
    },
    BARD: {
      name: 'Bard',
      icon: '🪕',
      color: '#fbbf24',
      damage: 45,
      speed: 850,
      range: 230,
      type: 'soundwave',
      spriteKey: 'HERO_BARD',
      role: 'Aura & Mana',
      desc: 'Plays inspiration chords for continuous Aether, +25% ally aura, and piercing soundwaves!',
      mechanic: 'Generates mana pulses, boosts adjacent damage, and fires line-piercing musical notes.'
    },
    VAMPIRE: {
      name: 'Vampire',
      icon: '🧛',
      color: '#dc2626',
      damage: 42,
      speed: 850,
      range: 210,
      type: 'vampire',
      spriteKey: 'HERO_VAMPIRE',
      role: 'Blood Magic',
      desc: 'Leeches Aether on hit and casts Blood Sigil Squares on the track (+75% DMG & constant mana)!',
      mechanic: 'Bites curse creeps for +Aether per hit and spawns illuminated Blood Magic Squares.'
    },
    CULTIST: {
      name: 'Cultist',
      icon: '🕯️',
      color: '#6366f1',
      damage: 50,
      speed: 850,
      range: 230,
      type: 'cultist',
      spriteKey: 'HERO_CULTIST',
      role: 'Formation DPS',
      desc: 'Form a Cross (✝️) to unleash Harbinger Void Scythes (3.5x splash). Sacrifices empower damage!',
      mechanic: 'Center of cross becomes Harbinger with dark scythes. Merges add sacrifice stacks.'
    },
    RIDINGHOOD: {
      name: 'Riding Hood',
      icon: '🐺',
      color: '#b91c1c',
      damage: 60,
      speed: 750,
      range: 200,
      type: 'wolf',
      spriteKey: 'HERO_RIDINGHOOD',
      role: 'Frenzy Cleave',
      desc: 'Absorbs wolf essence to enter Alpha Werewolf Frenzy: 3 rapid claw swipes & heavy bleed!',
      mechanic: 'Charges wolf meter on merge/hits, transforming into claw-slashing beast.'
    },
    MERMAID: {
      name: 'Mermaid',
      icon: '🧜‍♀️',
      color: '#06b6d4',
      damage: 48,
      speed: 900,
      range: 220,
      type: 'mermaid',
      spriteKey: 'HERO_MERMAID',
      role: 'Tidal Control',
      desc: 'Traps creeps in floating Bubble Prisons (2.5s stun + crush) and shields allies with +40% Speed!',
      mechanic: 'Water sphere bubbles trap and crush monsters. Coral bubbles buff ally attack speed.'
    },
    RANGER: {
      name: 'Aether Ranger',
      icon: '🏹',
      color: '#38bdf8',
      damage: 52,
      speed: 700,
      range: 260,
      type: 'single',
      spriteKey: 'HERO_RANGER',
      role: 'Sniper Single',
      desc: 'Long-range rapid sharpshooter with a 20% execute chance on low-health enemies!',
      mechanic: 'Extreme range and high single target DPS with critical execute headshots.'
    },
    PYRO: {
      name: 'Pyromancer',
      icon: '🔥',
      color: '#ef4444',
      damage: 75,
      speed: 1100,
      range: 200,
      type: 'splash',
      spriteKey: 'HERO_PYRO',
      role: 'Area Burn',
      desc: 'Launches exploding fireballs that leave burning magma ground patches on the path!',
      mechanic: 'Splash damage impact leaves burning ground hazards that damage all passing creeps.'
    },
    TEMPEST: {
      name: 'Tempest Zap',
      icon: '⚡',
      color: '#eab308',
      damage: 50,
      speed: 900,
      range: 215,
      type: 'chain',
      spriteKey: 'HERO_TEMPEST',
      role: 'Chain Shock',
      desc: 'Fires chain lightning bolts that bounce to up to 4 enemies, interrupting and shocking them!',
      mechanic: 'Chain lightning strikes multiple targets in sequence with micro-stuns.'
    },
    VENOM: {
      name: 'Venom Alchemist',
      icon: '🧪',
      color: '#10b981',
      damage: 32,
      speed: 950,
      range: 210,
      type: 'dot',
      spriteKey: 'HERO_VENOM',
      role: 'Acid Corrosion',
      desc: 'Throws toxic flasks creating corrosive acid pools that amplify all damage taken by +35%!',
      mechanic: 'Applies stacking poison damage over time and armor corrosion.'
    },
    FROST: {
      name: 'Frost Sorceress',
      icon: '❄️',
      color: '#8b5cf6',
      damage: 38,
      speed: 1050,
      range: 210,
      type: 'slow',
      spriteKey: 'HERO_FROST',
      role: 'Glacial Freeze',
      desc: 'Casts glacial frost shards that freeze creeps solid for 1.5s and slow surrounding monsters by 60%!',
      mechanic: 'High crowd control with freeze stops and area chill slowdown.'
    },
    GUARDIAN: {
      name: 'Aether Guardian',
      icon: '🛡️',
      color: '#f59e0b',
      damage: 28,
      speed: 1200,
      range: 160,
      type: 'buff',
      spriteKey: 'HERO_GUARDIAN',
      role: 'Aegis Aura',
      desc: 'Projects a radiant golden aegis that boosts damage and attack speed of adjacent allies by +30%!',
      mechanic: 'Support buffer increasing firepower of surrounding units.'
    },
    SIPHON: {
      name: 'Mana Siphon',
      icon: '💎',
      color: '#0ea5e9',
      damage: 25,
      speed: 1300,
      range: 160,
      type: 'econ',
      spriteKey: 'HERO_SIPHON',
      role: 'Astral Generator',
      desc: 'Passively channels steady Aether crystals into your reserves every second & fires energy beams!',
      mechanic: 'Generates consistent economy to accelerate board summoning and merges.'
    },
    ASSASSIN: {
      name: 'Void Assassin',
      icon: '⚔️',
      color: '#ec4899',
      damage: 100,
      speed: 900,
      range: 220,
      type: 'crit',
      spriteKey: 'HERO_ASSASSIN',
      role: 'Lethal Striker',
      desc: 'Teleports shadow daggers behind high-threat enemies with a 40% chance for a 3.5x Critical Strike!',
      mechanic: 'Massive burst damage against bosses and priority targets.'
    }
  };

  const TYPE_KEYS = Object.keys(UNIT_ARCHETYPES);

  // UNLOCKED GUARDIANS STORAGE & RANDOM STARTER GENERATOR
  function getUnlockedGuardians() {
    let unlocked = JSON.parse(localStorage.getItem('drag0n_aether_unlocked') || 'null');
    if (!unlocked || !Array.isArray(unlocked) || unlocked.length === 0) {
      // Pick 5 random distinct starter units from TYPE_KEYS
      const shuffled = [...TYPE_KEYS].sort(() => 0.5 - Math.random());
      unlocked = shuffled.slice(0, 5);
      localStorage.setItem('drag0n_aether_unlocked', JSON.stringify(unlocked));
    }
    return unlocked;
  }

  function saveUnlockedGuardians(list) {
    localStorage.setItem('drag0n_aether_unlocked', JSON.stringify(list));
  }

  // Boss Roster with custom vector sprites
  const BOSS_TYPES = [
    { name: 'Gorgon Stone Hydra', spriteKey: 'BOSS_GORGON', hpMult: 35, color: '#10b981', desc: 'Petrifies nearby units and turns defense to stone!' },
    { name: 'Bedlam Mad Jester', spriteKey: 'BOSS_BEDLAM', hpMult: 32, color: '#f43f5e', desc: 'Scrambles guardian positions on the board!' },
    { name: 'Warlock Void Weaver', spriteKey: 'BOSS_WARLOCK', hpMult: 38, color: '#a855f7', desc: 'Casts dark void circles that purge buffs!' },
    { name: 'Tribunal Arbiter', spriteKey: 'BOSS_TRIBUNAL', hpMult: 42, color: '#fbbf24', desc: 'Astral scales of judgment halve higher rank damage!' },
    { name: 'Puppeteer Strings', spriteKey: 'BOSS_PUPPETEER', hpMult: 40, color: '#818cf8', desc: 'Pulls units with puppet strings to reduce attack speed!' }
  ];

  // Game state
  let canvas, ctx;
  let grid = []; // 3 rows x 5 cols = 15 tiles
  let creeps = [];
  let projectiles = [];
  let floatingTexts = [];
  let particles = [];
  let bloodSquares = [];
  let firePatches = [];
  let waterVortices = [];
  let alliedCoralBuffs = [];

  let aether = 450;
  let playerDeck = [];
  let summonCost = 100;
  let castleHealth = 5;
  let maxCastleHealth = 5;
  let wave = 1;
  let waveTimer = 0;
  let creepsToSpawn = 0;
  let spawnInterval = 0;
  let isGameOver = false;
  let isPaused = false;
  let selectedTile = null;
  let gameLoopId = null;

  let scrapCounter = 0;
  let cultistSacrifices = 0;

  // Power Up Levels per archetype (1 to 5)
  let powerLevels = {};
  TYPE_KEYS.forEach(k => { powerLevels[k] = 1; });

  // Winding Path through the Astral Realm
  const PATH = [
    { x: 500, y: -20 },
    { x: 500, y: 130 },
    { x: 40,  y: 130 },
    { x: 40,  y: 290 },
    { x: 500, y: 290 },
    { x: 500, y: 470 },
    { x: 270, y: 470 },
    { x: 270, y: 660 }
  ];

  function initGame() {
    canvas = document.getElementById('as-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    // Initialize 3x5 Grid in lower section (y: 495 to 650)
    grid = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 5; c++) {
        grid.push({
          row: r, col: c,
          x: 20 + c * 102,
          y: 495 + r * 56,
          w: 94, h: 50,
          unit: null
        });
      }
    }

    aether = 450;
    summonCost = 100;
    castleHealth = 5;
    maxCastleHealth = 5;
    wave = 1;
    creeps = [];
    projectiles = [];
    floatingTexts = [];
    particles = [];
    bloodSquares = [];
    firePatches = [];
    waterVortices = [];
    alliedCoralBuffs = [];
    scrapCounter = 0;
    cultistSacrifices = 0;
    isGameOver = false;
    selectedTile = null;

    TYPE_KEYS.forEach(k => { powerLevels[k] = 1; });

    startWave(1);

    canvas.removeEventListener('click', handleCanvasClick);
    canvas.addEventListener('click', handleCanvasClick);

    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    lastTime = performance.now();
    gameLoopId = requestAnimationFrame(gameLoop);

    updateUI();
  }

  function startWave(waveNum) {
    wave = waveNum;
    const isBossWave = (wave % 5 === 0);
    creepsToSpawn = isBossWave ? 1 : (10 + wave * 4);
    spawnInterval = isBossWave ? 2500 : Math.max(350, 1100 - wave * 40);
    waveTimer = 0;
  }

  function spawnCreep() {
    const isBoss = (wave % 5 === 0) && creepsToSpawn === 1;
    const bossInfo = isBoss ? BOSS_TYPES[(Math.floor(wave / 5) - 1) % BOSS_TYPES.length] : null;

    const baseHp = 130 * Math.pow(1.23, wave - 1);
    const hp = isBoss ? baseHp * bossInfo.hpMult : baseHp;
    const speed = isBoss ? 0.55 : (0.85 + Math.min(0.75, wave * 0.035));

    creeps.push({
      id: Math.random(),
      x: PATH[0].x,
      y: PATH[0].y,
      pathIdx: 0,
      hp: hp,
      maxHp: hp,
      speed: speed,
      slowTimer: 0,
      freezeTimer: 0,
      bubbleTimer: 0,
      corrodeTimer: 0,
      poisonTimer: 0,
      poisonDmg: 0,
      bloodCurse: false,
      isBoss: isBoss,
      bossInfo: bossInfo,
      radius: isBoss ? 28 : 13,
      color: isBoss ? bossInfo.color : (wave % 3 === 0 ? '#38bdf8' : (wave % 2 === 0 ? '#fbbf24' : '#f43f5e'))
    });
  }

  window.summonAetherUnit = function() {
    if (isGameOver || aether < summonCost) return;

    const emptyTiles = grid.filter(t => !t.unit);
    if (emptyTiles.length === 0) {
      alert("Board is full! Merge or scrap units to make room!");
      return;
    }

    aether -= summonCost;
    summonCost = Math.floor(summonCost * 1.13);

    const randomTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    const randomKey = playerDeck[Math.floor(Math.random() * playerDeck.length)];

    randomTile.unit = {
      typeKey: randomKey,
      rank: 1,
      lastShot: 0,
      wolfMeter: 0,
      bardPulse: 0
    };

    createSparkles(randomTile.x + 47, randomTile.y + 25, UNIT_ARCHETYPES[randomKey].color, 14);
    updateUI();
  };

  window.upgradeAetherPower = function(typeKey) {
    const cost = powerLevels[typeKey] * 160;
    if (aether >= cost && powerLevels[typeKey] < 5) {
      aether -= cost;
      powerLevels[typeKey]++;
      floatingTexts.push({ x: 270, y: 470, text: `${UNIT_ARCHETYPES[typeKey].name} LEVEL UP! ⭐`, color: UNIT_ARCHETYPES[typeKey].color, life: 40 });
      updateUI();
    }
  };

  function getTileAt(r, c) {
    return grid.find(t => t.row === r && t.col === c);
  }

  function isBladeDancerDancing(tile) {
    if (!tile.unit || tile.unit.typeKey !== 'BLADEDANCER') return false;
    const neighbors = [
      getTileAt(tile.row - 1, tile.col),
      getTileAt(tile.row + 1, tile.col),
      getTileAt(tile.row, tile.col - 1),
      getTileAt(tile.row, tile.col + 1)
    ];
    for (let n of neighbors) {
      if (n && n.unit && n.unit.typeKey === 'BLADEDANCER') {
        return false;
      }
    }
    return true;
  }

  function isCultistCrossHarbinger(tile) {
    if (!tile.unit || tile.unit.typeKey !== 'CULTIST') return false;
    const up = getTileAt(tile.row - 1, tile.col);
    const down = getTileAt(tile.row + 1, tile.col);
    const left = getTileAt(tile.row, tile.col - 1);
    const right = getTileAt(tile.row, tile.col + 1);

    return (up && up.unit && up.unit.typeKey === 'CULTIST' &&
            down && down.unit && down.unit.typeKey === 'CULTIST' &&
            left && left.unit && left.unit.typeKey === 'CULTIST' &&
            right && right.unit && right.unit.typeKey === 'CULTIST');
  }

  function getTotalDHRanks() {
    let total = 0;
    for (let t of grid) {
      if (t.unit && t.unit.typeKey === 'DEMONHUNTER') {
        total += t.unit.rank;
      }
    }
    return total;
  }

  function handleCanvasClick(e) {
    if (isGameOver) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    for (let tile of grid) {
      if (mx >= tile.x && mx <= tile.x + tile.w && my >= tile.y && my <= tile.y + tile.h) {
        if (!selectedTile) {
          if (tile.unit) selectedTile = tile;
        } else {
          if (selectedTile !== tile && tile.unit && selectedTile.unit) {
            const u1 = selectedTile.unit;
            const u2 = tile.unit;

            // 1. HARLEQUIN UNIVERSAL CLONE
            if (u1.typeKey === 'HARLEQUIN' && u1.rank === u2.rank) {
              selectedTile.unit = {
                typeKey: u2.typeKey,
                rank: u1.rank,
                lastShot: 0
              };
              createSparkles(selectedTile.x + 47, selectedTile.y + 25, '#f43f5e', 22);
              floatingTexts.push({ x: selectedTile.x + 47, y: selectedTile.y + 15, text: `CLONED ${UNIT_ARCHETYPES[u2.typeKey].name}! 🎭`, color: '#f43f5e', life: 45 });
              selectedTile = null;
              updateUI();
              return;
            }
            if (u2.typeKey === 'HARLEQUIN' && u1.rank === u2.rank) {
              tile.unit = {
                typeKey: u1.typeKey,
                rank: u2.rank,
                lastShot: 0
              };
              createSparkles(tile.x + 47, tile.y + 25, '#f43f5e', 22);
              floatingTexts.push({ x: tile.x + 47, y: tile.y + 15, text: `CLONED ${UNIT_ARCHETYPES[u1.typeKey].name}! 🎭`, color: '#f43f5e', life: 45 });
              selectedTile = null;
              updateUI();
              return;
            }

            // 2. DRYAD DIRECT RANK UP
            if (u1.typeKey === 'DRYAD' && u1.rank === u2.rank && u2.typeKey !== 'DRYAD') {
              u2.rank = Math.min(5, u2.rank + 1);
              selectedTile.unit = null;
              createSparkles(tile.x + 47, tile.y + 25, '#10b981', 25);
              floatingTexts.push({ x: tile.x + 47, y: tile.y + 15, text: `+1 RANK (T${u2.rank})! 🌿`, color: '#10b981', life: 45 });
              selectedTile = null;
              updateUI();
              return;
            }

            // 3. SCRAPPER DEVOUR & UPGRADE
            if (u1.typeKey === 'SCRAPPER' && u2.rank <= u1.rank) {
              tile.unit = null;
              scrapCounter++;
              aether += 50;
              createSparkles(selectedTile.x + 47, selectedTile.y + 25, '#f59e0b', 20);
              floatingTexts.push({ x: selectedTile.x + 47, y: selectedTile.y + 15, text: `SCRAPPED! (+50💎) ⚙️`, color: '#f59e0b', life: 40 });

              if (scrapCounter >= 3) {
                scrapCounter = 0;
                const eligible = grid.filter(t => t.unit && t.unit.typeKey !== 'SCRAPPER' && t.unit.rank < 5);
                if (eligible.length > 0) {
                  const targetAlly = eligible[Math.floor(Math.random() * eligible.length)];
                  targetAlly.unit.rank++;
                  createSparkles(targetAlly.x + 47, targetAlly.y + 25, '#fbbf24', 30);
                  floatingTexts.push({ x: targetAlly.x + 47, y: targetAlly.y + 10, text: `SCRAP UPGRADE! ⭐`, color: '#fbbf24', life: 50 });
                }
              }
              selectedTile = null;
              updateUI();
              return;
            }

            // 4. RIDING HOOD ABSORB ESSENCE
            if (u1.typeKey === 'RIDINGHOOD' && u2.typeKey === 'RIDINGHOOD' && u1.rank === u2.rank) {
              u1.wolfMeter = (u1.wolfMeter || 0) + 1;
            }

            // 5. CULTIST CORNER SACRIFICE
            if (u1.typeKey === 'CULTIST' && u2.typeKey === 'CULTIST' && u1.rank === u2.rank) {
              cultistSacrifices++;
              floatingTexts.push({ x: tile.x + 47, y: tile.y + 10, text: `SACRIFICE +15% 🔥`, color: '#6366f1', life: 40 });
            }

            // 6. STANDARD MERGE
            if (u1.typeKey === u2.typeKey && u1.rank === u2.rank && u1.rank < 5) {
              const nextRank = u1.rank + 1;
              const nextKey = playerDeck[Math.floor(Math.random() * playerDeck.length)];

              tile.unit = {
                typeKey: nextKey,
                rank: nextRank,
                lastShot: 0,
                wolfMeter: 0,
                bardPulse: 0
              };
              selectedTile.unit = null;
              selectedTile = null;

              createSparkles(tile.x + 47, tile.y + 25, '#fbbf24', 25);
              floatingTexts.push({ x: tile.x + 47, y: tile.y + 15, text: `RANK ${nextRank}! ⭐`, color: '#fbbf24', life: 45 });
              updateUI();
              return;
            }
          }
          selectedTile = (tile.unit ? tile : null);
        }
        return;
      }
    }
    selectedTile = null;
  }

  function createSparkles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3.5;
      particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: color,
        size: 2 + Math.random() * 3,
        life: 30
      });
    }
  }

  let lastTime = performance.now();

  function gameLoop(now) {
    const dt = Math.min(0.1, (now - lastTime) / 1000);
    lastTime = now;

    if (!isPaused && !isGameOver) {
      update(dt);
    }
    render();

    gameLoopId = requestAnimationFrame(gameLoop);
  }

  function update(dt) {
    // 1. Passive Generation
    for (let tile of grid) {
      if (!tile.unit) continue;
      const u = tile.unit;

      if (u.typeKey === 'SIPHON') {
        const pLvl = powerLevels['SIPHON'] || 1;
        aether += dt * (4 + u.rank * 2.5 + pLvl * 1.5);
      }

      if (u.typeKey === 'BARD') {
        u.bardPulse = (u.bardPulse || 0) + dt;
        if (u.bardPulse >= 3.5) {
          u.bardPulse = 0;
          const manaGain = 25 + u.rank * 10;
          aether += manaGain;
          floatingTexts.push({ x: tile.x + 47, y: tile.y - 10, text: `+${manaGain}💎 CHORD`, color: '#fbbf24', life: 35 });
        }
      }

      if (u.typeKey === 'MERMAID') {
        u.mermaidPulse = (u.mermaidPulse || 0) + dt;
        if (u.mermaidPulse >= 5.0) {
          u.mermaidPulse = 0;
          const activeAllies = grid.filter(t => t.unit && t !== tile);
          if (activeAllies.length > 0) {
            const target1 = activeAllies[Math.floor(Math.random() * activeAllies.length)];
            alliedCoralBuffs.push({ tile: target1, duration: 6.0 });
            floatingTexts.push({ x: target1.x + 47, y: target1.y - 5, text: `CORAL SHIELD! 🫧`, color: '#06b6d4', life: 40 });
          }
        }
      }

      if (u.typeKey === 'VAMPIRE') {
        u.vampPulse = (u.vampPulse || 0) + dt;
        if (u.vampPulse >= 7.0) {
          u.vampPulse = 0;
          const randomPathIdx = 1 + Math.floor(Math.random() * (PATH.length - 2));
          const pPos = PATH[randomPathIdx];
          bloodSquares.push({
            x: pPos.x,
            y: pPos.y,
            duration: 8.0,
            size: 44
          });
          floatingTexts.push({ x: pPos.x, y: pPos.y - 15, text: `BLOOD SIGIL SQUARE! 🩸`, color: '#dc2626', life: 45 });
        }
      }
    }

    // Update Blood Sigil Squares
    for (let i = bloodSquares.length - 1; i >= 0; i--) {
      const sq = bloodSquares[i];
      sq.duration -= dt;
      if (sq.duration <= 0) {
        bloodSquares.splice(i, 1);
        continue;
      }
      for (let c of creeps) {
        if (Math.abs(c.x - sq.x) < sq.size / 2 && Math.abs(c.y - sq.y) < sq.size / 2) {
          c.hp -= 20 * dt;
          aether += 8 * dt;
        }
      }
    }

    // Update Fire Patches
    for (let i = firePatches.length - 1; i >= 0; i--) {
      const fp = firePatches[i];
      fp.duration -= dt;
      if (fp.duration <= 0) {
        firePatches.splice(i, 1);
        continue;
      }
      for (let c of creeps) {
        if (Math.hypot(c.x - fp.x, c.y - fp.y) < fp.radius) {
          c.hp -= fp.dps * dt;
        }
      }
    }

    // Update Allied Coral Buffs
    for (let i = alliedCoralBuffs.length - 1; i >= 0; i--) {
      alliedCoralBuffs[i].duration -= dt;
      if (alliedCoralBuffs[i].duration <= 0) {
        alliedCoralBuffs.splice(i, 1);
      }
    }

    // 2. Creep Spawning Logic
    if (creepsToSpawn > 0) {
      waveTimer += dt * 1000;
      if (waveTimer >= spawnInterval) {
        spawnCreep();
        creepsToSpawn--;
        waveTimer = 0;
      }
    } else if (creeps.length === 0 && !isGameOver) {
      const reward = 70 + wave * 35;
      aether += reward;
      floatingTexts.push({ x: 270, y: 320, text: `WAVE ${wave} CLEARED! +${reward} AETHER`, color: '#34d399', life: 60 });
      
      if (wave % 5 === 0) {
        let curDC = parseInt(localStorage.getItem('drag0n_dc') || '0');
        let bonusDC = 120 + wave * 15;
        localStorage.setItem('drag0n_dc', (curDC + bonusDC).toString());
        if (window.addXP) window.addXP(250);
        if (window.updateProfileWidget) window.updateProfileWidget();
        alert(`🏆 BOSS DEFEATED! Earned +${bonusDC} Dragon Coins & +250 XP!`);
      }

      startWave(wave + 1);
      updateUI();
    }

    // 3. Update Creeps Position & Statuses
    for (let i = creeps.length - 1; i >= 0; i--) {
      const c = creeps[i];

      if (c.poisonTimer > 0) {
        c.poisonTimer -= dt;
        c.hp -= c.poisonDmg * dt;
      }

      if (c.freezeTimer > 0) {
        c.freezeTimer -= dt;
      }

      if (c.bubbleTimer > 0) {
        c.bubbleTimer -= dt;
        c.hp -= 25 * dt;
      }

      if (c.corrodeTimer > 0) {
        c.corrodeTimer -= dt;
      }

      let effSpeed = c.speed;
      if (c.slowTimer > 0) {
        c.slowTimer -= dt;
        effSpeed *= 0.5;
      }
      if (c.freezeTimer > 0 || c.bubbleTimer > 0) {
        effSpeed = 0;
      }

      const target = PATH[c.pathIdx + 1];
      if (target) {
        const dx = target.x - c.x;
        const dy = target.y - c.y;
        const dist = Math.hypot(dx, dy);
        const step = effSpeed * 70 * dt;

        if (dist <= step) {
          c.x = target.x;
          c.y = target.y;
          c.pathIdx++;
          if (c.pathIdx >= PATH.length - 1) {
            castleHealth--;
            creeps.splice(i, 1);
            updateUI();
            if (castleHealth <= 0) {
              isGameOver = true;
              alert(`☠️ SANCTUARY FALLEN! You survived ${wave - 1} waves in Aether Siege!`);
            }
            continue;
          }
        } else {
          c.x += (dx / dist) * step;
          c.y += (dy / dist) * step;
        }
      }

      if (c.hp <= 0) {
        const aetherGain = c.isBoss ? 280 : (14 + Math.floor(wave * 2.2));
        aether += aetherGain;
        createSparkles(c.x, c.y, c.color, 12);
        creeps.splice(i, 1);
        updateUI();
      }
    }

    // 4. Units Attack Logic
    const nowMs = performance.now();
    const totalDHRanks = getTotalDHRanks();

    for (let tile of grid) {
      if (!tile.unit || creeps.length === 0) continue;

      const u = tile.unit;
      const def = UNIT_ARCHETYPES[u.typeKey];
      const pLvl = powerLevels[u.typeKey] || 1;

      let speedMult = 1.0;

      if (u.typeKey === 'BLADEDANCER' && isBladeDancerDancing(tile)) {
        speedMult *= 2.5;
      }

      if (alliedCoralBuffs.some(b => b.tile === tile)) {
        speedMult *= 1.4;
      }

      const neighbors = [
        getTileAt(tile.row - 1, tile.col),
        getTileAt(tile.row + 1, tile.col),
        getTileAt(tile.row, tile.col - 1),
        getTileAt(tile.row, tile.col + 1)
      ];
      let auraDmgMult = 1.0;
      for (let n of neighbors) {
        if (n && n.unit && n.unit.typeKey === 'GUARDIAN') {
          auraDmgMult += 0.30 * n.unit.rank;
          speedMult *= 1.15;
        }
        if (n && n.unit && n.unit.typeKey === 'BARD') {
          auraDmgMult += 0.25;
        }
      }

      const fireInterval = (def.speed / speedMult) / (1 + (u.rank - 1) * 0.35);

      if (nowMs - u.lastShot >= fireInterval) {
        const ux = tile.x + 47;
        const uy = tile.y + 25;

        let targets = [];
        let sortedCreeps = [...creeps].sort((a, b) => {
          const distA = Math.hypot(a.x - ux, a.y - uy);
          const distB = Math.hypot(b.x - ux, b.y - uy);
          return distA - distB;
        });

        let maxTargets = 1;
        if (u.typeKey === 'DEMONHUNTER') {
          if (totalDHRanks >= 40) maxTargets = 4;
          else if (totalDHRanks >= 20) maxTargets = 3;
          else if (totalDHRanks >= 10) maxTargets = 2;
        } else if (u.typeKey === 'RIDINGHOOD' && (u.wolfMeter || 0) >= 1) {
          maxTargets = 3;
        }

        for (let c of sortedCreeps) {
          if (Math.hypot(c.x - ux, c.y - uy) <= def.range) {
            targets.push(c);
            if (targets.length >= maxTargets) break;
          }
        }

        if (targets.length > 0) {
          u.lastShot = nowMs;

          let baseDmg = def.damage * Math.pow(2.2, u.rank - 1) * (1 + (pLvl - 1) * 0.35) * auraDmgMult;

          if (u.typeKey === 'BLADEDANCER' && isBladeDancerDancing(tile)) {
            baseDmg *= 2.8;
          }

          if (u.typeKey === 'DEMONHUNTER') {
            if (totalDHRanks >= 40) baseDmg *= 2.5;
            else if (totalDHRanks >= 20) baseDmg *= 1.6;
            else if (totalDHRanks >= 10) baseDmg *= 1.25;
          }

          if (u.typeKey === 'CULTIST') {
            if (isCultistCrossHarbinger(tile)) {
              baseDmg *= 3.5 * (1 + cultistSacrifices * 0.15);
            }
          }

          if (u.typeKey === 'ASSASSIN' && Math.random() < 0.40) {
            baseDmg *= 3.5;
            floatingTexts.push({ x: targets[0].x, y: targets[0].y - 15, text: `CRIT! 💥`, color: '#ec4899', life: 30 });
          }

          targets.forEach(tgt => {
            projectiles.push({
              sx: ux, sy: uy,
              tx: tgt.x, ty: tgt.y,
              targetId: tgt.id,
              color: def.color,
              damage: baseDmg,
              type: def.type,
              typeKey: u.typeKey,
              rank: u.rank,
              progress: 0
            });
          });
        }
      }
    }

    // 5. Update Projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.progress += dt * 7.5;

      if (p.progress >= 1.0) {
        const target = creeps.find(c => c.id === p.targetId);
        if (target) {
          let finalDmg = p.damage;
          if (target.corrodeTimer > 0) finalDmg *= 1.35;

          for (let sq of bloodSquares) {
            if (Math.abs(target.x - sq.x) < sq.size / 2 && Math.abs(target.y - sq.y) < sq.size / 2) {
              finalDmg *= 1.75;
              aether += 5;
            }
          }

          target.hp -= finalDmg;
          floatingTexts.push({ x: target.x, y: target.y - 10, text: `-${Math.round(finalDmg)}`, color: p.color, life: 25 });

          if (p.typeKey === 'VAMPIRE') {
            target.bloodCurse = true;
            aether += 5 + p.rank * 2;
            floatingTexts.push({ x: target.x, y: target.y - 20, text: `+${5 + p.rank * 2}💎`, color: '#dc2626', life: 25 });
          } else if (p.typeKey === 'MERMAID') {
            target.bubbleTimer = 2.5;
            createSparkles(target.x, target.y, '#06b6d4', 16);
          } else if (p.typeKey === 'FROST') {
            target.freezeTimer = 1.5;
            target.slowTimer = 3.5;
          } else if (p.typeKey === 'PYRO') {
            firePatches.push({
              x: target.x, y: target.y,
              duration: 3.5,
              radius: 48,
              dps: p.damage * 0.4
            });
          } else if (p.typeKey === 'VENOM') {
            target.corrodeTimer = 4.0;
            target.poisonTimer = 3.5;
            target.poisonDmg = p.damage * 0.7;
          } else if (p.typeKey === 'TEMPEST') {
            let chained = 0;
            for (let other of creeps) {
              if (other !== target && Math.hypot(other.x - target.x, other.y - target.y) < 110) {
                other.hp -= p.damage * 0.7;
                other.slowTimer = 1.0;
                chained++;
                if (chained >= 3) break;
              }
            }
          } else if (p.typeKey === 'CULTIST' && p.damage > 150) {
            for (let other of creeps) {
              if (other !== target && Math.hypot(other.x - target.x, other.y - target.y) < 65) {
                other.hp -= p.damage * 0.5;
              }
            }
          } else if (p.typeKey === 'RANGER' && target.hp < target.maxHp * 0.25) {
            if (Math.random() < 0.25) {
              target.hp = 0;
              floatingTexts.push({ x: target.x, y: target.y - 20, text: `EXECUTE! 🎯`, color: '#38bdf8', life: 35 });
            }
          }
        }
        projectiles.splice(i, 1);
      }
    }

    // 6. Update Particles & Texts
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) particles.splice(i, 1);
    }

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y -= dt * 28;
      ft.life -= dt * 60;
      if (ft.life <= 0) floatingTexts.splice(i, 1);
    }
  }

  function render() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(1, '#131b2e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.beginPath();
    ctx.moveTo(PATH[0].x, PATH[0].y);
    for (let i = 1; i < PATH.length; i++) {
      ctx.lineTo(PATH[i].x, PATH[i].y);
    }
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
    ctx.lineWidth = 36;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.strokeStyle = 'rgba(192, 132, 252, 0.15)';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Render Blood Sigil Squares
    for (let sq of bloodSquares) {
      ctx.fillStyle = 'rgba(220, 38, 38, 0.25)';
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.fillRect(sq.x - sq.size / 2, sq.y - sq.size / 2, sq.size, sq.size);
      ctx.strokeRect(sq.x - sq.size / 2, sq.y - sq.size / 2, sq.size, sq.size);

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🩸 SIGIL', sq.x, sq.y + 4);
    }

    // Render Fire Patches
    for (let fp of firePatches) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.beginPath();
      ctx.arc(fp.x, fp.y, fp.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // End Sanctuary Portal
    const endP = PATH[PATH.length - 1];
    ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
    ctx.beginPath();
    ctx.arc(endP.x, endP.y, 28, 0, Math.PI * 2);
    ctx.fill();
    if (window.DragonSprites && window.DragonSprites.drawSprite(ctx, 'SANCTUARY_HEART', endP.x, endP.y - 4, 30)) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${castleHealth}`, endP.x, endP.y + 16);
    } else {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`SANCTUARY (${castleHealth})`, endP.x, endP.y + 4);
    }

    // Total DH Tiers Banner
    const totalDHRanks = getTotalDHRanks();
    if (playerDeck.includes('DEMONHUNTER') && totalDHRanks > 0) {
      ctx.fillStyle = totalDHRanks >= 40 ? '#ec4899' : '#a855f7';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'left';
      const dhMode = totalDHRanks >= 40 ? 'APEX TRANSCENDENCE (4 Targets)' : (totalDHRanks >= 20 ? 'Tier 20+ (3 Targets)' : (totalDHRanks >= 10 ? 'Tier 10+ (2 Targets)' : 'Tier < 10'));
      ctx.fillText(`DH Charges: ${totalDHRanks} Ranks — ${dhMode}`, 20, 480);
    }

    // Render Board Cells (3x5)
    for (let tile of grid) {
      const isSel = (selectedTile === tile);
      ctx.fillStyle = isSel ? 'rgba(56, 189, 248, 0.35)' : 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = isSel ? '#38bdf8' : 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.roundRect(tile.x, tile.y, tile.w, tile.h, 12);
      ctx.fill();
      ctx.stroke();

      if (tile.unit) {
        const u = tile.unit;
        const def = UNIT_ARCHETYPES[u.typeKey];

        const isDancing = (u.typeKey === 'BLADEDANCER' && isBladeDancerDancing(tile));
        const isHarbinger = (u.typeKey === 'CULTIST' && isCultistCrossHarbinger(tile));
        const hasCoralBuff = alliedCoralBuffs.some(b => b.tile === tile);

        ctx.fillStyle = def.color + '33';
        ctx.strokeStyle = isDancing ? '#38bdf8' : (isHarbinger ? '#6366f1' : def.color);
        ctx.lineWidth = (isDancing || isHarbinger) ? 3 : 1.5;
        ctx.beginPath();
        ctx.roundRect(tile.x + 4, tile.y + 4, tile.w - 8, tile.h - 8, 8);
        ctx.fill();
        ctx.stroke();

        // Draw Hero Sprite
        const sKey = def.spriteKey || ('HERO_' + u.typeKey);
        const drawn = window.DragonSprites ? window.DragonSprites.drawSprite(ctx, sKey, tile.x + 28, tile.y + 32, 40) : false;
        if (!drawn) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '20px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(def.icon, tile.x + 28, tile.y + 32);
        }

        // Draw Rank Stars
        const starCount = Math.min(u.rank, 5);
        for (let s = 0; s < starCount; s++) {
          const sx = tile.x + tile.w - 14 - s * 12;
          const sy = tile.y + 16;
          if (window.DragonSprites && window.DragonSprites.drawSprite(ctx, 'RANK_STAR', sx, sy, 14)) {
            // rendered
          } else {
            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 10px sans-serif';
            ctx.fillText('★', sx, sy);
          }
        }
        if (u.rank > 5) {
          ctx.fillStyle = '#fef08a';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText(`+${u.rank - 5}`, tile.x + tile.w - 12, tile.y + 28);
        }

        if (isDancing) {
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('DANCING', tile.x + 65, tile.y + 40);
        } else if (isHarbinger) {
          ctx.fillStyle = '#a855f7';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('HARBINGER', tile.x + 65, tile.y + 40);
        } else if (hasCoralBuff) {
          ctx.fillStyle = '#06b6d4';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('CORAL', tile.x + 65, tile.y + 40);
        }
      }
    }

    // Render Creeps & Bosses
    for (let c of creeps) {
      ctx.fillStyle = c.color;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (c.isBoss && c.bossInfo) {
        const bDrawn = (c.bossInfo.spriteKey && window.DragonSprites) ? window.DragonSprites.drawSprite(ctx, c.bossInfo.spriteKey, c.x, c.y, 44) : false;
        if (!bDrawn) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(c.bossInfo.icon || '👾', c.x, c.y + 5);
        }
      }

      if (c.bubbleTimer > 0) {
        ctx.fillStyle = 'rgba(6, 182, 212, 0.45)';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius + 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      if (c.freezeTimer > 0) {
        ctx.fillStyle = 'rgba(139, 92, 246, 0.45)';
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius + 4, 0, Math.PI * 2);
        ctx.fill();
      }

      const hpPct = Math.max(0, c.hp / c.maxHp);
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(c.x - 18, c.y - c.radius - 8, 36, 5);
      ctx.fillStyle = hpPct > 0.4 ? '#34d399' : '#ef4444';
      ctx.fillRect(c.x - 18, c.y - c.radius - 8, 36 * hpPct, 5);
    }

    // Render Projectiles
    for (let p of projectiles) {
      const curX = p.sx + (p.tx - p.sx) * p.progress;
      const curY = p.sy + (p.ty - p.sy) * p.progress;

      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(curX, curY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render Particles
    for (let pt of particles) {
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render Floating Text
    for (let ft of floatingTexts) {
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
    }
  }

  function updateUI() {
    const aetherEl = document.getElementById('as-aether');
    const costEl = document.getElementById('as-summon-cost');
    const waveEl = document.getElementById('as-wave');
    const livesEl = document.getElementById('as-lives');

    if (aetherEl) aetherEl.innerText = Math.floor(aether);
    if (costEl) costEl.innerText = summonCost;
    if (waveEl) waveEl.innerText = wave;
    if (livesEl) livesEl.innerText = '❤️'.repeat(castleHealth);

    playerDeck.forEach(k => {
      const btn = document.getElementById(`as-up-${k.toLowerCase()}`);
      if (btn) {
        const lvl = powerLevels[k] || 1;
        const cost = lvl * 160;
        btn.innerText = `Lvl ${lvl} (${cost}A)`;
        btn.disabled = (aether < cost || lvl >= 5);
      }
    });
  }

  // UNLOCK GUARDIAN WITH DRAGON COINS
  window.unlockGuardian = function(key, e) {
    if (e) e.stopPropagation();
    const def = UNIT_ARCHETYPES[key];
    let curDC = parseInt(localStorage.getItem('drag0n_dc') || '0');

    if (curDC < UNLOCK_COST_DC) {
      alert(`⚠️ You need ${UNLOCK_COST_DC} Dragon Coins (DC) to unlock ${def.name}!\n\nYou currently have: ${curDC} DC.\nEarn DC by defeating Bosses in Aether Siege (+100+ DC), playing Chess vs AI, or daily login!`);
      return;
    }

    if (confirm(`Unlock ${def.icon} ${def.name} for ${UNLOCK_COST_DC} Dragon Coins?`)) {
      curDC -= UNLOCK_COST_DC;
      localStorage.setItem('drag0n_dc', curDC.toString());

      const unlocked = getUnlockedGuardians();
      if (!unlocked.includes(key)) {
        unlocked.push(key);
        saveUnlockedGuardians(unlocked);
      }

      if (window.updateProfileWidget) window.updateProfileWidget();
      if (typeof firebase !== 'undefined' && localStorage.getItem('drag0n_user')) {
        firebase.database().ref('users/' + localStorage.getItem('drag0n_user').toLowerCase() + '/dc').set(curDC);
      }

      alert(`🎉 UNLOCKED! ${def.icon} ${def.name} is now available in your deck builder!`);
      renderDeckBuilder();
    }
  };

  // ADVANCED DECK BUILDER UI WITH STARTERS & UNLOCKS
  function renderDeckBuilder() {
    const gridEl = document.getElementById('deck-selection-grid');
    const previewEl = document.getElementById('selected-deck-preview');
    const countEl = document.getElementById('deck-count');
    const startBtn = document.getElementById('start-battle-btn');
    const dcBalEl = document.getElementById('deck-dc-balance');

    if (!gridEl) return;

    const unlocked = getUnlockedGuardians();
    const curDC = parseInt(localStorage.getItem('drag0n_dc') || '0');
    if (dcBalEl) dcBalEl.innerText = `${curDC} DC`;

    // Initialize playerDeck with unlocked starters if empty or invalid
    if (playerDeck.length === 0) {
      playerDeck = unlocked.slice(0, 5);
    } else {
      // Ensure only unlocked cards remain in deck
      playerDeck = playerDeck.filter(k => unlocked.includes(k));
    }

    gridEl.innerHTML = '';
    previewEl.innerHTML = '';
    countEl.innerText = playerDeck.length;

    // Render all 18 unit archetypes
    TYPE_KEYS.forEach(key => {
      const def = UNIT_ARCHETYPES[key];
      const isUnlocked = unlocked.includes(key);
      const isSelected = isUnlocked && playerDeck.includes(key);

      const card = document.createElement('div');
      card.style.padding = '0.9rem';
      card.style.borderRadius = '14px';
      card.style.position = 'relative';
      card.style.transition = 'all 0.2s ease';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.justifyContent = 'space-between';
      card.style.textAlign = 'left';

      if (isUnlocked) {
        card.style.cursor = 'pointer';
        card.style.border = `2px solid ${isSelected ? def.color : 'rgba(255,255,255,0.1)'}`;
        card.style.background = isSelected ? `${def.color}22` : 'rgba(11, 14, 23, 0.85)';
        card.style.opacity = '1';

        const iconHtml = window.DragonSprites ? window.DragonSprites.renderSVG(def.spriteKey || ('HERO_' + key), 42) : `<span style="font-size: 2rem;">${def.icon}</span>`;
        card.innerHTML = `
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
              <span>${iconHtml}</span>
              <span style="font-size: 0.72rem; font-weight: bold; background: ${def.color}33; color: ${def.color}; padding: 2px 8px; border-radius: 9999px;">${def.role}</span>
            </div>
            <div style="font-weight: 800; font-size: 1rem; margin-bottom: 0.2rem; color: ${def.color};">${def.name}</div>
            <div style="font-size: 0.76rem; color: #cbd5e1; line-height: 1.35; margin-bottom: 0.5rem;">${def.desc}</div>
          </div>
          <div style="font-size: 0.7rem; font-weight: 700; color: ${isSelected ? '#34d399' : 'var(--text-muted)'}; text-align: right;">
            ${isSelected ? 'ACTIVE IN DECK' : '+ ADD TO DECK'}
          </div>
        `;

        card.onclick = () => {
          if (isSelected) {
            playerDeck = playerDeck.filter(k => k !== key);
          } else if (playerDeck.length < 5) {
            playerDeck.push(key);
          }
          renderDeckBuilder();
        };

      } else {
        // LOCKED CARD
        card.style.cursor = 'default';
        card.style.border = '1px dashed rgba(255, 255, 255, 0.15)';
        card.style.background = 'rgba(15, 23, 42, 0.6)';
        card.style.opacity = '0.75';

        const lockedIconHtml = window.DragonSprites ? window.DragonSprites.renderSVG(def.spriteKey || ('HERO_' + key), 42) : `<span style="font-size: 2rem;">${def.icon}</span>`;
        const coinIcon = window.DragonSprites ? window.DragonSprites.renderSVG('DRAGON_COIN', 16) : '🪙';
        card.innerHTML = `
          <div style="filter: grayscale(80%);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
              <span>${lockedIconHtml}</span>
              <span style="font-size: 0.7rem; font-weight: bold; background: rgba(255,255,255,0.1); color: #94a3b8; padding: 2px 8px; border-radius: 9999px;">LOCKED</span>
            </div>
            <div style="font-weight: 800; font-size: 1rem; margin-bottom: 0.2rem; color: #94a3b8;">${def.name}</div>
            <div style="font-size: 0.75rem; color: #64748b; line-height: 1.35; margin-bottom: 0.5rem;">${def.desc}</div>
          </div>
          <div style="margin-top: 0.5rem;">
            <button onclick="window.unlockGuardian('${key}', event)" style="width: 100%; padding: 6px 10px; font-size: 0.78rem; font-weight: 800; border-radius: 10px; background: linear-gradient(135deg, #eab308, #f59e0b); color: #0f172a; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(234,179,8,0.25); display: flex; align-items: center; justify-content: center; gap: 6px;">
              ${coinIcon} Unlock (${UNLOCK_COST_DC} DC)
            </button>
          </div>
        `;
      }

      gridEl.appendChild(card);
    });

    // Render Selected Preview Pills
    playerDeck.forEach(key => {
      const def = UNIT_ARCHETYPES[key];
      const pill = document.createElement('div');
      pill.style.padding = '6px 14px';
      pill.style.borderRadius = '20px';
      pill.style.background = `${def.color}33`;
      pill.style.border = `1px solid ${def.color}`;
      pill.style.color = '#fff';
      pill.style.fontSize = '0.85rem';
      pill.style.fontWeight = 'bold';
      pill.style.display = 'flex';
      pill.style.alignItems = 'center';
      pill.style.gap = '8px';
      const pillIcon = window.DragonSprites ? window.DragonSprites.renderSVG(def.spriteKey || ('HERO_' + key), 20) : def.icon;
      pill.innerHTML = `<span>${pillIcon}</span> <span>${def.name}</span>`;
      previewEl.appendChild(pill);
    });

    // Update Start Button
    if (playerDeck.length === 5) {
      startBtn.disabled = false;
      startBtn.style.opacity = '1';
      startBtn.style.cursor = 'pointer';
      startBtn.style.boxShadow = '0 0 24px rgba(56, 189, 248, 0.6)';
    } else {
      startBtn.disabled = true;
      startBtn.style.opacity = '0.5';
      startBtn.style.cursor = 'not-allowed';
      startBtn.style.boxShadow = 'none';
    }
  }

  window.startAetherSiege = function() {
    if (playerDeck.length !== 5) return;

    document.getElementById('deck-builder-ui').style.display = 'none';
    document.getElementById('battle-ui').style.display = 'grid';
    document.getElementById('battle-ui').style.gridTemplateColumns = 'repeat(auto-fit, minmax(330px, 1fr))';

    const powerLevelContainer = document.getElementById('dynamic-power-levels');
    powerLevelContainer.innerHTML = '';

    playerDeck.forEach(key => {
      const def = UNIT_ARCHETYPES[key];
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.alignItems = 'center';
      row.style.background = 'rgba(0,0,0,0.35)';
      row.style.padding = '8px 12px';
      row.style.borderRadius = '10px';

      const rowIcon = window.DragonSprites ? window.DragonSprites.renderSVG(def.spriteKey || ('HERO_' + key), 24) : def.icon;
      row.innerHTML = `
        <span style="display: flex; align-items: center; gap: 8px; font-weight: 600;">${rowIcon} ${def.name}</span>
        <button id="as-up-${key.toLowerCase()}" onclick="window.upgradeAetherPower('${key}')" style="padding: 4px 12px; font-size: 0.8rem; font-weight: 800; background: ${def.color}; color: #0b0e17; border: none; border-radius: 8px; cursor: pointer;">Lvl 1</button>
      `;
      powerLevelContainer.appendChild(row);
    });

    initGame();
  };

  window.initAetherSiegeUI = function() {
    initGame();
  };

  window.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('deck-builder-ui')) {
      renderDeckBuilder();
    }
  });
})();
