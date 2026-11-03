/* ==========================================================================
   DRAG0N PET MUTATION LAB & HYBRID ENGINE (2026)
   Allows combining 2-3 pets into unique hybrid companions with
   dominant inherited traits, custom SVG rendering, live preview,
   drippy neon green styling, and full integration across
   Arcade Chess, Pet Room, and Screen Companion.
   ========================================================================== */

(function(global) {
  'use strict';

  // 1. BASE PET ROSTER
  const PET_ROSTER = {
    dragon: {
      id: 'dragon',
      name: 'Ignis',
      species: 'Dragon',
      icon: '🐉',
      color: '#a855f7',
      traits: {
        bodyType: 'dragon',
        earsHorns: 'dragon_horns',
        eyesExpression: 'dragon_fierce',
        tail: 'dragon_spikes',
        skinPattern: 'obsidian_violet',
        wingsApparel: 'dragon_wings',
        specialEffects: 'dragon_embers',
        personalitySound: 'dragon_roar'
      }
    },
    cat: {
      id: 'cat',
      name: 'Neko',
      species: 'Cat',
      icon: '🐱',
      color: '#f97316',
      traits: {
        bodyType: 'cat',
        earsHorns: 'cat_ears',
        eyesExpression: 'cat_glint',
        tail: 'cat_long',
        skinPattern: 'calico_patches',
        wingsApparel: 'none',
        specialEffects: 'sweet_hearts',
        personalitySound: 'cat_purr'
      }
    },
    cyber_puppy: {
      id: 'cyber_puppy',
      name: 'Sparky',
      species: 'Cyber Puppy',
      icon: '🐶',
      color: '#06b6d4',
      traits: {
        bodyType: 'cyber_chassis',
        earsHorns: 'cyber_antenna',
        eyesExpression: 'cyber_visor',
        tail: 'cyber_wire',
        skinPattern: 'neon_cyan_magenta',
        wingsApparel: 'cyber_glider',
        specialEffects: 'cyber_sparks',
        personalitySound: 'cyber_synth'
      }
    },
    red_panda: {
      id: 'red_panda',
      name: 'Rusty',
      species: 'Red Panda',
      icon: '🦊',
      color: '#ea580c',
      traits: {
        bodyType: 'red_panda',
        earsHorns: 'red_panda_ears',
        eyesExpression: 'red_panda_sweet',
        tail: 'red_panda_ringed',
        skinPattern: 'rust_white',
        wingsApparel: 'none',
        specialEffects: 'falling_leaves',
        personalitySound: 'panda_chitter'
      }
    },
    golden_hamster: {
      id: 'golden_hamster',
      name: 'Nugget',
      species: 'Golden Hamster',
      icon: '🐹',
      color: '#f59e0b',
      traits: {
        bodyType: 'hamster_round',
        earsHorns: 'hamster_ears',
        eyesExpression: 'hamster_beady',
        tail: 'hamster_puff',
        skinPattern: 'golden_honey',
        wingsApparel: 'none',
        specialEffects: 'sparkle_crumbs',
        personalitySound: 'hamster_squeak'
      }
    },
    arctic_fox: {
      id: 'arctic_fox',
      name: 'Blizzard',
      species: 'Arctic Fox',
      icon: '🐺',
      color: '#38bdf8',
      traits: {
        bodyType: 'fox_agile',
        earsHorns: 'arctic_fox_ears',
        eyesExpression: 'ice_crystal_eyes',
        tail: 'arctic_fox_tail',
        skinPattern: 'snow_frost',
        wingsApparel: 'none',
        specialEffects: 'ice_mist',
        personalitySound: 'arctic_yelp'
      }
    },
    sloth: {
      id: 'sloth',
      name: 'Flash',
      species: 'Sloth',
      icon: '🦥',
      color: '#84cc16',
      traits: {
        bodyType: 'sloth_zen',
        earsHorns: 'sloth_round',
        eyesExpression: 'sloth_sleepy',
        tail: 'sloth_stub',
        skinPattern: 'mossy_olive',
        wingsApparel: 'none',
        specialEffects: 'floating_zzz',
        personalitySound: 'sloth_yawn'
      }
    },
    cosmic_axolotl: {
      id: 'cosmic_axolotl',
      name: 'Aura',
      species: 'Cosmic Axolotl',
      icon: '🦎',
      color: '#c084fc',
      traits: {
        bodyType: 'axolotl_amphibian',
        earsHorns: 'axolotl_frills',
        eyesExpression: 'cosmic_starlight',
        tail: 'axolotl_fin',
        skinPattern: 'astral_nebula',
        wingsApparel: 'mana_fins',
        specialEffects: 'cosmic_stardust',
        personalitySound: 'cosmic_hum'
      }
    },
    koala: {
      id: 'koala',
      name: 'Euca',
      species: 'Koala',
      icon: '🐨',
      color: '#94a3b8',
      traits: {
        bodyType: 'koala_snug',
        earsHorns: 'koala_fuzzy_ears',
        eyesExpression: 'koala_gentle',
        tail: 'none',
        skinPattern: 'silver_ash',
        wingsApparel: 'none',
        specialEffects: 'eucalyptus_breeze',
        personalitySound: 'koala_grunt'
      }
    },
    meerkat: {
      id: 'meerkat',
      name: 'Scout',
      species: 'Meerkat',
      icon: '🦫',
      color: '#d97706',
      traits: {
        bodyType: 'meerkat_upright',
        earsHorns: 'meerkat_ears',
        eyesExpression: 'meerkat_alert',
        tail: 'meerkat_slender',
        skinPattern: 'desert_sand',
        wingsApparel: 'none',
        specialEffects: 'sand_drift',
        personalitySound: 'meerkat_chatter'
      }
    },
    bunny: {
      id: 'bunny',
      name: 'Usagi',
      species: 'Bunny',
      icon: '🐰',
      color: '#ec4899',
      traits: {
        bodyType: 'bunny',
        earsHorns: 'bunny_ears',
        eyesExpression: 'bunny_gentle',
        tail: 'hamster_puff',
        skinPattern: 'pure_snow',
        wingsApparel: 'none',
        specialEffects: 'sweet_hearts',
        personalitySound: 'bunny_hop'
      }
    },
    frog: {
      id: 'frog',
      name: 'Kero',
      species: 'Frog',
      icon: '🐸',
      color: '#22c55e',
      traits: {
        bodyType: 'frog_squat',
        earsHorns: 'none',
        eyesExpression: 'frog_bulbous',
        tail: 'none',
        skinPattern: 'mossy_olive',
        wingsApparel: 'none',
        specialEffects: 'water_ripples',
        personalitySound: 'frog_croak'
      }
    },
    fox: {
      id: 'fox',
      name: 'Kitsune',
      species: 'Fox',
      icon: '🦊',
      color: '#f97316',
      traits: {
        bodyType: 'fox_agile',
        earsHorns: 'arctic_fox_ears',
        eyesExpression: 'fox_winking',
        tail: 'fox_brush',
        skinPattern: 'rust_white',
        wingsApparel: 'none',
        specialEffects: 'kitsune_fire',
        personalitySound: 'kitsune_laugh'
      }
    },
    owl: {
      id: 'owl',
      name: 'Hoot',
      species: 'Owl',
      icon: '🦉',
      color: '#d97706',
      traits: {
        bodyType: 'owl_feathered',
        earsHorns: 'feather_tufts',
        eyesExpression: 'owl_wise',
        tail: 'feather_tail',
        skinPattern: 'midnight_brown',
        wingsApparel: 'feather_wings',
        specialEffects: 'starlight_spark',
        personalitySound: 'owl_hoot'
      }
    },
    shark: {
      id: 'shark',
      name: 'Fin',
      species: 'Shark',
      icon: '🦈',
      color: '#64748b',
      traits: {
        bodyType: 'shark_streamlined',
        earsHorns: 'shark_dorsal',
        eyesExpression: 'shark_keen',
        tail: 'shark_fin',
        skinPattern: 'oceanic_slate',
        wingsApparel: 'none',
        specialEffects: 'water_ripples',
        personalitySound: 'shark_splash'
      }
    },
    unicorn: {
      id: 'unicorn',
      name: 'Uni',
      species: 'Unicorn',
      icon: '🦄',
      color: '#ec4899',
      traits: {
        bodyType: 'unicorn_graceful',
        earsHorns: 'unicorn_horn',
        eyesExpression: 'unicorn_stars',
        tail: 'unicorn_flowing',
        skinPattern: 'rainbow_pastel',
        wingsApparel: 'none',
        specialEffects: 'rainbow_aura',
        personalitySound: 'unicorn_whinny'
      }
    },
    slime: {
      id: 'slime',
      name: 'Gloop',
      species: 'Slime',
      icon: '👾',
      color: '#10b981',
      traits: {
        bodyType: 'slime_blob',
        earsHorns: 'slime_sprout',
        eyesExpression: 'slime_happy',
        tail: 'none',
        skinPattern: 'toxic_neon_green',
        wingsApparel: 'none',
        specialEffects: 'toxic_drip',
        personalitySound: 'slime_bubble'
      }
    }
  };

  // 2. TRAIT DEFINITIONS
  const TRAIT_CATALOG = {
    bodyType: {
      label: 'Body Type',
      options: [
        { id: 'dragon', label: 'Dragon Scaled Frame' },
        { id: 'cat', label: 'Cat Nimble Body' },
        { id: 'cyber_chassis', label: 'Cyber Mech Chassis' },
        { id: 'axolotl_amphibian', label: 'Axolotl Aquatic Form' },
        { id: 'red_panda', label: 'Red Panda Stout Build' },
        { id: 'hamster_round', label: 'Hamster Chubby Form' },
        { id: 'fox_agile', label: 'Fox Graceful Stride' },
        { id: 'sloth_zen', label: 'Sloth Relaxed Posture' },
        { id: 'slime_blob', label: 'Slime Jelly Bulk' },
        { id: 'shark_streamlined', label: 'Shark Hydrodynamic Torso' }
      ]
    },
    earsHorns: {
      label: 'Ears & Horns',
      options: [
        { id: 'dragon_horns', label: 'Obsidian Dragon Horns' },
        { id: 'cat_ears', label: 'Perked Cat Ears' },
        { id: 'cyber_antenna', label: 'Holo-Sensor Antennae' },
        { id: 'axolotl_frills', label: 'Feathery Axolotl Frills' },
        { id: 'koala_fuzzy_ears', label: 'Fuzzy Koala Ears' },
        { id: 'arctic_fox_ears', label: 'Keen Fox Ears' },
        { id: 'hamster_ears', label: 'Tiny Round Hamster Ears' },
        { id: 'unicorn_horn', label: 'Glowing Spiral Horn' },
        { id: 'slime_sprout', label: 'Bio-Gel Plant Sprout' },
        { id: 'none', label: 'Smooth / None' }
      ]
    },
    eyesExpression: {
      label: 'Eyes & Expression',
      options: [
        { id: 'cyber_visor', label: 'Cyber Glowing LED Visor' },
        { id: 'dragon_fierce', label: 'Smoldering Dragon Slits' },
        { id: 'cat_glint', label: 'Kawaii Cat Double-Glints' },
        { id: 'cosmic_starlight', label: 'Starlight Nebula Pupils' },
        { id: 'ice_crystal_eyes', label: 'Crystalline Ice Blue Eyes' },
        { id: 'sloth_sleepy', label: 'Chill Half-Closed Eyes' },
        { id: 'fox_winking', label: 'Sly Fox Wink' },
        { id: 'hamster_beady', label: 'Curious Beady Eyes' }
      ]
    },
    tail: {
      label: 'Tail',
      options: [
        { id: 'dragon_spikes', label: 'Spiked Dragon Flail Tail' },
        { id: 'red_panda_ringed', label: 'Fluffy Ringed Tail' },
        { id: 'cyber_wire', label: 'Fiber-Optic Neon Wire' },
        { id: 'fox_brush', label: 'Bushy Kitsune Brush' },
        { id: 'axolotl_fin', label: 'Webbed Cosmic Fin Tail' },
        { id: 'cat_long', label: 'Sleek Calico Tail' },
        { id: 'hamster_puff', label: 'Tiny Cotton Puff' },
        { id: 'shark_fin', label: 'Ocean Shark Caudal Fin' },
        { id: 'none', label: 'None' }
      ]
    },
    skinPattern: {
      label: 'Skin & Coat Color',
      options: [
        { id: 'toxic_neon_green', label: 'Bio-Toxic Neon Sludge (#39ff14)' },
        { id: 'obsidian_violet', label: 'Obsidian Violet Ember (#a855f7)' },
        { id: 'neon_cyan_magenta', label: 'Cyberpunk Cyan & Magenta (#06b6d4)' },
        { id: 'astral_nebula', label: 'Astral Star Nebula (#c084fc)' },
        { id: 'rust_white', label: 'Red Panda Autumn Rust (#ea580c)' },
        { id: 'snow_frost', label: 'Diamond Frost Snow (#e0f2fe)' },
        { id: 'golden_honey', label: 'Golden Honey Fur (#f59e0b)' },
        { id: 'calico_patches', label: 'Calico Sunburst (#fb923c)' },
        { id: 'rainbow_pastel', label: 'Prismatic Rainbow (#f472b6)' }
      ]
    },
    wingsApparel: {
      label: 'Wings & Apparel',
      options: [
        { id: 'dragon_wings', label: 'Leathery Dragon Wings' },
        { id: 'cyber_glider', label: 'Neon Glider Wings' },
        { id: 'mana_fins', label: 'Floating Mana Fin Cloak' },
        { id: 'royal_crown_cape', label: 'Golden Crown & Regal Cape' },
        { id: 'feather_wings', label: 'Feathered Astral Wings' },
        { id: 'none', label: 'None (Natural Hybrid)' }
      ]
    },
    specialEffects: {
      label: 'Aura & Special Effects',
      options: [
        { id: 'toxic_drip', label: 'Drippy Toxic Green Slime Ooze' },
        { id: 'dragon_embers', label: 'Floating Dragon Fire Embers' },
        { id: 'cyber_sparks', label: 'Electric Blue Glitch Sparks' },
        { id: 'cosmic_stardust', label: 'Orbiting Stardust Clusters' },
        { id: 'ice_mist', label: 'Crystalline Ice Mist Particles' },
        { id: 'rainbow_aura', label: 'Pulsing Rainbow Shimmer' },
        { id: 'sweet_hearts', label: 'Floating Affection Hearts' }
      ]
    },
    personalitySound: {
      label: 'Personality & Voice',
      options: [
        { id: 'dragon_roar', label: 'Dragon Flame Roar (Majestic & Fierce)' },
        { id: 'cyber_synth', label: 'Cybernetic Synth Bark (Visor Alarms)' },
        { id: 'cat_purr', label: 'Purring Chimera (Playful & Sassy)' },
        { id: 'cosmic_hum', label: 'Cosmic Starlight Hum (Wise & Celestial)' },
        { id: 'sloth_yawn', label: 'Zen Sloth Hum (Ultra Relaxed)' },
        { id: 'panda_chitter', label: 'Mischievous Chitter (Hyperactive)' },
        { id: 'kitsune_laugh', label: 'Sly Fox Chortle (Tactical Trickster)' }
      ]
    }
  };

  // 3. SOUND SYNTHESIZER (Native Web Audio API)
  function playSynthSound(type) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      if (type === 'purr') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.linearRampToValueAtTime(120, now + 0.35);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now); osc.stop(now + 0.35);
      } else if (type === 'roar' || type === 'dragon_roar') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(95, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.5);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now); osc.stop(now + 0.5);
      } else if (type === 'cyber' || type === 'cyber_synth') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(880, now + 0.08);
        osc.frequency.setValueAtTime(660, now + 0.16);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
      } else if (type === 'mutate' || type === 'zap') {
        // Bio-mutation laser & bubble zap
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(900, now + 0.25);
        osc.frequency.linearRampToValueAtTime(300, now + 0.5);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now); osc.stop(now + 0.6);
      } else if (type === 'bubble' || type === 'drip') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now); osc.stop(now + 0.15);
      } else if (type === 'victory') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.type = 'triangle';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.08, now + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
          osc.start(now + i * 0.1); osc.stop(now + i * 0.1 + 0.3);
        });
      }
    } catch (e) {
      // AudioContext unavailable or blocked
    }
  }

  // 4. STORAGE HELPERS
  function getMutatedPets() {
    try {
      return JSON.parse(localStorage.getItem('drag0n_mutated_pets') || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveMutatedPet(pet) {
    const list = getMutatedPets();
    // Prepend or replace
    const existingIdx = list.findIndex(p => p.id === pet.id);
    if (existingIdx >= 0) {
      list[existingIdx] = pet;
    } else {
      list.unshift(pet);
    }
    localStorage.setItem('drag0n_mutated_pets', JSON.stringify(list));
    // Trigger global event so companions / room / games sync immediately
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent('drag0n_pet_mutated', { detail: pet }));
      } catch (e) {}
    }
    return list;
  }

  function deleteMutatedPet(id) {
    let list = getMutatedPets();
    list = list.filter(p => p.id !== id);
    localStorage.setItem('drag0n_mutated_pets', JSON.stringify(list));
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent('drag0n_pet_mutated', { detail: { id, deleted: true } }));
      } catch (e) {}
    }
    return list;
  }

  // 5. HYBRID PET SVG GENERATOR
  function renderHybridPetSVG(petOrTraits, size = 64, options = {}) {
    const traits = petOrTraits.traits || petOrTraits;
    const body = traits.bodyType || 'cat';
    const ears = traits.earsHorns || 'cat_ears';
    const eyes = traits.eyesExpression || 'cat_glint';
    const tail = traits.tail || 'cat_long';
    const skin = traits.skinPattern || 'toxic_neon_green';
    const wings = traits.wingsApparel || 'none';
    const fx = traits.specialEffects || 'toxic_drip';

    // Color definitions based on skin pattern
    const PALETTES = {
      toxic_neon_green: { base: '#22c55e', light: '#86efac', dark: '#14532d', glow: '#39ff14', accent: '#a3e635' },
      obsidian_violet: { base: '#9333ea', light: '#e9d5ff', dark: '#3b0764', glow: '#d946ef', accent: '#facc15' },
      neon_cyan_magenta: { base: '#06b6d4', light: '#a5f3fc', dark: '#083344', glow: '#ec4899', accent: '#22d3ee' },
      astral_nebula: { base: '#8b5cf6', light: '#ede9fe', dark: '#2e1065', glow: '#c084fc', accent: '#38bdf8' },
      rust_white: { base: '#ea580c', light: '#ffedd5', dark: '#7c2d12', glow: '#f97316', accent: '#f8fafc' },
      snow_frost: { base: '#e0f2fe', light: '#ffffff', dark: '#0369a1', glow: '#38bdf8', accent: '#7dd3fc' },
      golden_honey: { base: '#f59e0b', light: '#fef3c7', dark: '#78350f', glow: '#fbbf24', accent: '#d97706' },
      calico_patches: { base: '#f8fafc', light: '#ffffff', dark: '#334155', glow: '#fb923c', accent: '#fb923c' },
      rainbow_pastel: { base: '#fdf2f8', light: '#fce7f3', dark: '#831843', glow: '#f472b6', accent: '#a855f7' }
    };
    const pal = PALETTES[skin] || PALETTES.toxic_neon_green;

    // Filters for Special Effects
    let filterDef = '';
    let filterAttr = '';
    let effectOverlay = '';

    if (fx === 'toxic_drip') {
      filterDef = `
        <filter id="mutant-toxic-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#39ff14" flood-opacity="0.8"/>
        </filter>
      `;
      filterAttr = `filter="url(#mutant-toxic-glow)"`;
      effectOverlay = `
        <!-- Animated Drips -->
        <g class="pet-fx-drips">
          <circle cx="20" cy="54" r="2" fill="#39ff14" opacity="0.9">
            <animate attributeName="cy" values="52;58;52" dur="1.8s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.9;0.2;0.9" dur="1.8s" repeatCount="indefinite"/>
          </circle>
          <circle cx="36" cy="56" r="2.5" fill="#39ff14" opacity="0.85">
            <animate attributeName="cy" values="54;62;54" dur="1.5s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.85;0.1;0.85" dur="1.5s" repeatCount="indefinite"/>
          </circle>
          <circle cx="48" cy="53" r="1.8" fill="#a3e635" opacity="0.8">
            <animate attributeName="cy" values="52;59;52" dur="2.1s" repeatCount="indefinite"/>
          </circle>
        </g>
      `;
    } else if (fx === 'dragon_embers') {
      filterDef = `
        <filter id="mutant-ember-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#f59e0b" flood-opacity="0.7"/>
        </filter>
      `;
      filterAttr = `filter="url(#mutant-ember-glow)"`;
      effectOverlay = `
        <g class="pet-fx-embers">
          <circle cx="16" cy="30" r="1.8" fill="#f59e0b">
            <animate attributeName="cy" values="30;18;30" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="48" cy="28" r="2" fill="#ef4444">
            <animate attributeName="cy" values="28;14;28" dur="1.7s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.9;0;0.9" dur="1.7s" repeatCount="indefinite"/>
          </circle>
        </g>
      `;
    } else if (fx === 'cyber_sparks') {
      filterDef = `
        <filter id="mutant-cyber-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#22d3ee" flood-opacity="0.8"/>
        </filter>
      `;
      filterAttr = `filter="url(#mutant-cyber-glow)"`;
      effectOverlay = `
        <g class="pet-fx-sparks">
          <path d="M14 26 L17 22 L15 28 L19 24" stroke="#22d3ee" stroke-width="1.5" fill="none">
            <animate attributeName="opacity" values="0;1;0" dur="0.8s" repeatCount="indefinite"/>
          </path>
          <path d="M49 22 L52 18 L50 24 L54 20" stroke="#ec4899" stroke-width="1.5" fill="none">
            <animate attributeName="opacity" values="1;0;1" dur="0.9s" repeatCount="indefinite"/>
          </path>
        </g>
      `;
    } else if (fx === 'cosmic_stardust') {
      filterDef = `
        <filter id="mutant-stardust-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="3.5" flood-color="#c084fc" flood-opacity="0.8"/>
        </filter>
      `;
      filterAttr = `filter="url(#mutant-stardust-glow)"`;
      effectOverlay = `
        <g class="pet-fx-stars">
          <polygon points="12,18 14,22 18,22 15,25 16,29 12,26 8,29 9,25 6,22 10,22" fill="#facc15" opacity="0.85">
            <animateTransform attributeName="transform" type="rotate" from="0 12 24" to="360 12 24" dur="4s" repeatCount="indefinite"/>
          </polygon>
          <polygon points="50,16 51,19 54,19 52,21 53,24 50,22 47,24 48,21 46,19 49,19" fill="#38bdf8" opacity="0.85">
            <animateTransform attributeName="transform" type="rotate" from="360 50 20" to="0 50 20" dur="3s" repeatCount="indefinite"/>
          </polygon>
        </g>
      `;
    }

    // Wings rendering (behind or layered)
    let wingsSvg = '';
    if (wings === 'dragon_wings') {
      wingsSvg = `
        <g class="mutant-wings">
          <path class="dragon-wing-left" d="M20 34 C10 28, -6 18, -14 20 C-10 28, -4 36, -6 40 C0 36, 6 36, 10 38 Z" fill="${pal.glow}" stroke="${pal.dark}" stroke-width="1.5"/>
          <path class="dragon-wing-right" d="M44 34 C54 28, 70 18, 78 20 C74 28, 68 36, 70 40 C64 36, 58 36, 54 38 Z" fill="${pal.glow}" stroke="${pal.dark}" stroke-width="1.5"/>
        </g>
      `;
    } else if (wings === 'cyber_glider') {
      wingsSvg = `
        <g class="mutant-wings">
          <polygon points="20,32 4,24 10,38 18,36" fill="${pal.glow}" stroke="${pal.dark}" stroke-width="1.5" opacity="0.85"/>
          <polygon points="44,32 60,24 54,38 46,36" fill="${pal.glow}" stroke="${pal.dark}" stroke-width="1.5" opacity="0.85"/>
        </g>
      `;
    } else if (wings === 'mana_fins') {
      wingsSvg = `
        <g class="mutant-wings">
          <path d="M18 36 Q4 28 6 44 Q14 42 18 38 Z" fill="${pal.light}" stroke="${pal.glow}" stroke-width="1.5" opacity="0.8"/>
          <path d="M46 36 Q60 28 58 44 Q50 42 46 38 Z" fill="${pal.light}" stroke="${pal.glow}" stroke-width="1.5" opacity="0.8"/>
        </g>
      `;
    } else if (wings === 'feather_wings') {
      wingsSvg = `
        <g class="mutant-wings">
          <path d="M19 33 C12 24, 8 36, 17 44 Z" fill="${pal.light}" stroke="${pal.dark}" stroke-width="1.5"/>
          <path d="M45 33 C52 24, 56 36, 47 44 Z" fill="${pal.light}" stroke="${pal.dark}" stroke-width="1.5"/>
        </g>
      `;
    }

    // Tail rendering
    let tailSvg = '';
    if (tail === 'dragon_spikes') {
      tailSvg = `<path class="pet-tail-dragon" d="M44 42 Q55 48 59 40 L55 36 Z" fill="${pal.base}" stroke="${pal.dark}" stroke-width="1.5"/>`;
    } else if (tail === 'cyber_wire') {
      tailSvg = `<path class="pet-tail-cyber" d="M45 38 L55 28" stroke="${pal.glow}" stroke-width="3" stroke-linecap="round"/><circle cx="55" cy="28" r="3" fill="${pal.accent}"/>`;
    } else if (tail === 'red_panda_ringed') {
      tailSvg = `
        <path class="pet-tail" d="M44 42 Q60 48 56 28 L48 36 Z" fill="${pal.base}" stroke="${pal.dark}" stroke-width="1.5"/>
        <path d="M51 32 Q54 36 49 39" stroke="${pal.light}" stroke-width="2" fill="none"/>
        <path d="M53 28 Q56 31 52 34" stroke="${pal.dark}" stroke-width="2" fill="none"/>
      `;
    } else if (tail === 'fox_brush') {
      tailSvg = `
        <path class="pet-tail" d="M44 42 Q58 46 54 28 L46 36 Z" fill="${pal.base}" stroke="${pal.dark}" stroke-width="1.5"/>
        <path d="M54 28 Q56 25 50 24 L48 32 Z" fill="${pal.light}" stroke="${pal.dark}" stroke-width="1"/>
      `;
    } else if (tail === 'cat_long') {
      tailSvg = `<path class="pet-tail" d="M44 40 Q58 32 46 22 C44 20, 48 18, 50 20 Q62 30 46 44 Z" fill="${pal.glow}" stroke="${pal.dark}" stroke-width="1.5"/>`;
    } else if (tail === 'hamster_puff') {
      tailSvg = `<circle class="pet-tail-puff" cx="17" cy="42" r="5" fill="${pal.light}" stroke="${pal.dark}" stroke-width="1.5"/>`;
    } else if (tail === 'axolotl_fin') {
      tailSvg = `<path class="pet-tail" d="M44 42 Q62 46 56 32 C50 36 46 38 44 42 Z" fill="${pal.light}" stroke="${pal.glow}" stroke-width="1.5" opacity="0.85"/>`;
    } else if (tail === 'shark_fin') {
      tailSvg = `<path class="pet-tail-shark" d="M12 36 L2 28 L4 44 Z" fill="${pal.base}" stroke="${pal.dark}" stroke-width="1.5"/>`;
    }

    // Body rendering
    let bodySvg = '';
    if (body === 'cyber_chassis') {
      bodySvg = `
        <rect x="18" y="28" width="28" height="18" rx="6" fill="${pal.base}" stroke="${pal.dark}" stroke-width="2"/>
        <rect x="23" y="32" width="18" height="10" rx="2" fill="${pal.light}" opacity="0.3"/>
      `;
    } else if (body === 'slime_blob') {
      bodySvg = `
        <path d="M14 46 C12 34, 16 22, 32 22 C48 22, 52 34, 50 46 C38 49, 26 49, 14 46 Z" fill="${pal.base}" stroke="${pal.dark}" stroke-width="2" opacity="0.9"/>
      `;
    } else if (body === 'axolotl_amphibian') {
      bodySvg = `
        <path d="M18 36 C18 28, 46 28, 46 36 C46 46, 40 48, 32 48 C24 48, 18 46, 18 36 Z" fill="${pal.base}" stroke="${pal.dark}" stroke-width="2"/>
        <ellipse cx="32" cy="40" rx="9" ry="6" fill="${pal.light}" opacity="0.7"/>
      `;
    } else {
      // General quadruped / adorable plush body
      bodySvg = `
        <path d="M18 36 C18 28, 46 28, 46 36 C46 45, 42 48, 32 48 C22 48, 18 45, 18 36 Z" fill="${pal.base}" stroke="${pal.dark}" stroke-width="2"/>
        <path d="M26 36 C26 31, 38 31, 38 36 C38 43, 35 46, 32 46 C29 46, 26 43, 26 36 Z" fill="${pal.light}" opacity="0.6"/>
      `;
    }

    // Head base
    let headSvg = `
      <path class="pet-head" d="M19 22 C19 14, 45 14, 45 22 C45 31, 41 33, 32 33 C23 33, 19 31, 19 22 Z" fill="${pal.base}" stroke="${pal.dark}" stroke-width="2"/>
    `;
    if (body === 'cyber_chassis') {
      headSvg = `<rect class="pet-head" x="21" y="14" width="22" height="16" rx="5" fill="${pal.base}" stroke="${pal.dark}" stroke-width="2"/>`;
    }

    // Ears & Horns
    let earsSvg = '';
    if (ears === 'dragon_horns') {
      earsSvg = `
        <path d="M24 15 Q17 6 21 3 Q24 5 26 13 Z" fill="${pal.accent}" stroke="${pal.dark}" stroke-width="1.5"/>
        <path d="M40 15 Q47 6 43 3 Q40 5 38 13 Z" fill="${pal.accent}" stroke="${pal.dark}" stroke-width="1.5"/>
      `;
    } else if (ears === 'cat_ears') {
      earsSvg = `
        <path d="M19 16 L12 5 L23 12 Z" fill="${pal.base}" stroke="${pal.dark}" stroke-width="2"/>
        <path d="M19 16 L12 5 L23 12 Z" fill="${pal.glow}" transform="scale(0.85) translate(4, 3)"/>
        <path d="M45 16 L52 5 L41 12 Z" fill="${pal.base}" stroke="${pal.dark}" stroke-width="2"/>
        <path d="M45 16 L52 5 L41 12 Z" fill="${pal.glow}" transform="scale(0.85) translate(8, 3)"/>
      `;
    } else if (ears === 'cyber_antenna') {
      earsSvg = `
        <line x1="24" y1="14" x2="16" y2="6" stroke="${pal.glow}" stroke-width="2"/>
        <circle cx="16" cy="6" r="2.5" fill="${pal.accent}"/>
        <line x1="40" y1="14" x2="48" y2="6" stroke="${pal.glow}" stroke-width="2"/>
        <circle cx="48" cy="6" r="2.5" fill="${pal.accent}"/>
      `;
    } else if (ears === 'axolotl_frills') {
      earsSvg = `
        <g stroke="${pal.dark}" stroke-width="1.5" fill="${pal.glow}">
          <path d="M19 18 C12 16, 10 12, 14 10 C16 14, 18 16, 19 18 Z"/>
          <path d="M19 22 C11 22, 9 20, 13 18 C16 20, 18 21, 19 22 Z"/>
          <path d="M45 18 C52 16, 54 12, 50 10 C48 14, 46 16, 45 18 Z"/>
          <path d="M45 22 C53 22, 55 20, 51 18 C48 20, 46 21, 45 22 Z"/>
        </g>
      `;
    } else if (ears === 'koala_fuzzy_ears') {
      earsSvg = `
        <circle cx="17" cy="16" r="6" fill="${pal.base}" stroke="${pal.dark}" stroke-width="1.5"/>
        <circle cx="17" cy="16" r="3.5" fill="${pal.light}"/>
        <circle cx="47" cy="16" r="6" fill="${pal.base}" stroke="${pal.dark}" stroke-width="1.5"/>
        <circle cx="47" cy="16" r="3.5" fill="${pal.light}"/>
      `;
    } else if (ears === 'unicorn_horn') {
      earsSvg = `<polygon points="32,2 29,14 35,14" fill="#facc15" stroke="${pal.dark}" stroke-width="1.5"/>`;
    } else if (ears === 'slime_sprout') {
      earsSvg = `<path d="M32 14 Q28 8 32 4 Q36 8 32 14 Z" fill="#4ade80" stroke="#166534" stroke-width="1.5"/>`;
    }

    // Eyes & Expression
    let eyesSvg = '';
    if (eyes === 'cyber_visor') {
      eyesSvg = `
        <rect x="23" y="18" width="18" height="7" rx="2" fill="${pal.glow}" filter="drop-shadow(0 0 3px ${pal.glow})"/>
        <path d="M26 22 L28 19 L30 22" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <path d="M34 22 L36 19 L38 22" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      `;
    } else if (eyes === 'dragon_fierce') {
      eyesSvg = `
        <ellipse cx="27" cy="22" rx="3" ry="3.5" fill="${pal.dark}"/>
        <line x1="27" y1="19" x2="27" y2="25" stroke="${pal.accent}" stroke-width="1.8"/>
        <ellipse cx="37" cy="22" rx="3" ry="3.5" fill="${pal.dark}"/>
        <line x1="37" y1="19" x2="37" y2="25" stroke="${pal.accent}" stroke-width="1.8"/>
      `;
    } else if (eyes === 'cosmic_starlight') {
      eyesSvg = `
        <circle cx="27" cy="22" r="3" fill="#2e1065"/>
        <polygon points="27,20 28,22 30,22 28,23 29,25 27,23 25,25 26,23 24,22 26,22" fill="#facc15"/>
        <circle cx="37" cy="22" r="3" fill="#2e1065"/>
        <polygon points="37,20 38,22 40,22 38,23 39,25 37,23 35,25 36,23 34,22 36,22" fill="#facc15"/>
      `;
    } else if (eyes === 'sloth_sleepy') {
      eyesSvg = `
        <path d="M24 22 Q27 25 30 22" stroke="${pal.dark}" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M34 22 Q37 25 40 22" stroke="${pal.dark}" stroke-width="2" fill="none" stroke-linecap="round"/>
      `;
    } else if (eyes === 'fox_winking') {
      eyesSvg = `
        <path d="M24 22 Q27 25 30 22" stroke="${pal.dark}" stroke-width="2" fill="none" stroke-linecap="round"/>
        <circle cx="37" cy="22" r="2.5" fill="${pal.dark}"/>
        <circle cx="36" cy="21" r="0.8" fill="#fff"/>
      `;
    } else {
      // Cute anime / Kawaii glint eyes
      eyesSvg = `
        <ellipse cx="27" cy="22" rx="2.5" ry="3.2" fill="${pal.dark}"/>
        <circle cx="26" cy="20.5" r="0.9" fill="#fff"/>
        <ellipse cx="37" cy="22" rx="2.5" ry="3.2" fill="${pal.dark}"/>
        <circle cx="36" cy="20.5" r="0.9" fill="#fff"/>
        <circle cx="23" cy="25" r="2" fill="${pal.glow}" opacity="0.6"/>
        <circle cx="41" cy="25" r="2" fill="${pal.glow}" opacity="0.6"/>
      `;
    }

    // Snout / Smile
    const mouthSvg = `
      <path d="M30 26 Q32 28 34 26" stroke="${pal.dark}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    `;

    // Paws
    const pawsSvg = `
      <circle class="pet-paw paw-fl" cx="24" cy="50" r="4" fill="${pal.accent}" stroke="${pal.dark}" stroke-width="1.8"/>
      <circle class="pet-paw paw-fr" cx="40" cy="50" r="4" fill="${pal.accent}" stroke="${pal.dark}" stroke-width="1.8"/>
    `;

    // Apparel overlay
    let apparelSvg = '';
    if (wings === 'royal_crown_cape') {
      apparelSvg = `
        <polygon points="26,14 24,9 28,12 32,8 36,12 40,9 38,14" fill="#fbbf24" stroke="#78350f" stroke-width="1"/>
        <path d="M22 36 Q32 46 42 36 L40 46 L24 46 Z" fill="#dc2626" stroke="#991b1b" stroke-width="1" opacity="0.85"/>
      `;
    }

    return `
      <svg class="pet-svg mutant-pet-svg" viewBox="0 0 64 64" width="${size}" height="${size}" style="overflow: visible;" ${filterAttr}>
        <defs>
          ${filterDef}
        </defs>
        <ellipse cx="32" cy="51" rx="14" ry="3" fill="rgba(0,0,0,0.25)"/>
        ${wingsSvg}
        ${tailSvg}
        ${bodySvg}
        ${earsSvg}
        ${headSvg}
        ${eyesSvg}
        ${mouthSvg}
        ${pawsSvg}
        ${apparelSvg}
        ${effectOverlay}
      </svg>
    `;
  }

  // 6. MUTATION LAB UI GENERATOR & CONTROLLER
  function openMutationLabModal(preselectedParents = []) {
    let existingModal = document.getElementById('pet-mutation-modal');
    if (existingModal) existingModal.remove();

    const allPetKeys = Object.keys(PET_ROSTER);
    let selectedParents = preselectedParents.length ? [...preselectedParents].slice(0, 3) : ['dragon', 'cat', 'cyber_puppy'];
    if (selectedParents.length < 2) selectedParents = ['dragon', 'cat'];

    // Initial draft traits derived from first parent
    let currentTraits = { ...PET_ROSTER[selectedParents[0]].traits };
    currentTraits.skinPattern = 'toxic_neon_green';
    currentTraits.specialEffects = 'toxic_drip';

    const modal = document.createElement('div');
    modal.id = 'pet-mutation-modal';
    modal.className = 'mutation-modal-overlay';
    modal.innerHTML = `
      <div class="mutation-modal-card">
        <div class="mutation-header">
          <div class="mutation-badge">🧬 BIO-SYNTHESIS CHAMBER</div>
          <button class="mutation-close-btn" onclick="document.getElementById('pet-mutation-modal').remove()">✕</button>
        </div>
        <h2 class="mutation-title">Pet Gene Mutation Lab</h2>
        <p class="mutation-subtitle">Combine 2 to 3 companion mascots, synthesize dominant gene traits, and forge an all-new hybrid pet!</p>

        <div class="mutation-lab-grid">
          
          <!-- LEFT: Controls & Selectors -->
          <div class="mutation-controls-col">
            
            <!-- Step 1: Select 2-3 Parents -->
            <div class="mutation-section">
              <div class="section-heading">
                <span class="step-num">1</span>
                <span>Select 2 to 3 Parent Mascots</span>
                <span id="parents-count-badge" class="count-badge">${selectedParents.length}/3</span>
              </div>
              <div class="parents-picker-grid" id="parents-picker-grid">
                ${allPetKeys.map(k => {
                  const p = PET_ROSTER[k];
                  const isChecked = selectedParents.includes(k);
                  return `
                    <div class="parent-chip ${isChecked ? 'selected' : ''}" data-pet="${k}" onclick="window.PetMutationLab.toggleParent('${k}')">
                      <span class="chip-icon">${p.icon}</span>
                      <span class="chip-name">${p.name}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Step 2: Trait Pickers -->
            <div class="mutation-section">
              <div class="section-heading">
                <span class="step-num">2</span>
                <span>Select Dominant Gene Traits</span>
              </div>
              
              <div class="traits-container" id="traits-container">
                <!-- Dynamically populated trait categories -->
              </div>
            </div>

            <!-- Step 3: Custom Pet Name -->
            <div class="mutation-section">
              <div class="section-heading">
                <span class="step-num">3</span>
                <span>Name Your Hybrid Pet</span>
              </div>
              <div class="name-input-row">
                <input type="text" id="mutant-name-input" class="mutant-name-field" maxlength="28" value="Cyber Draco-Neko" placeholder="Enter custom hybrid name...">
                <button type="button" class="btn-random-name" onclick="window.PetMutationLab.randomizeName()">🎲 Random</button>
              </div>
            </div>

          </div>

          <!-- RIGHT: Live Bio-Preview & Drippy Neon Green Mutate Button -->
          <div class="mutation-preview-col">
            
            <div class="bio-chamber-container">
              <div class="chamber-glass-tube">
                <div class="chamber-bubbles"></div>
                <div class="chamber-specimen" id="chamber-specimen">
                  <!-- Live SVG Preview -->
                </div>
                <div class="chamber-status-tag" id="chamber-status-tag">STABLE SYNTHESIS READY</div>
              </div>
              <div class="chamber-pedestal"></div>
            </div>

            <!-- THE DRIPPY NEON GREEN MUTATE BUTTON -->
            <div class="drippy-button-wrapper">
              <div class="slime-drip-rack">
                <span class="slime-drop drop-1"></span>
                <span class="slime-drop drop-2"></span>
                <span class="slime-drop drop-3"></span>
                <span class="slime-drop drop-4"></span>
                <span class="slime-drop drop-5"></span>
              </div>
              <button id="btn-initiate-mutation" class="drippy-neon-green-btn" onclick="window.PetMutationLab.performMutation()">
                <span class="btn-glow-pulse"></span>
                <span class="btn-text">☣️ MUTATE HYBRID PET ☣️</span>
              </button>
            </div>

            <div id="mutation-success-card" class="mutation-success-card" style="display:none;"></div>

          </div>

        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Attach state handlers to window for inline onclicks
    window.PetMutationLab.currentSelectedParents = selectedParents;
    window.PetMutationLab.currentTraits = currentTraits;

    renderTraitSelectors();
    updateLivePreview();
  }

  function toggleParent(petKey) {
    let parents = window.PetMutationLab.currentSelectedParents;
    if (parents.includes(petKey)) {
      if (parents.length <= 2) {
        alert("A mutation requires at least 2 parent pets!");
        return;
      }
      parents = parents.filter(p => p !== petKey);
    } else {
      if (parents.length >= 3) {
        alert("You can select a maximum of 3 parent pets!");
        return;
      }
      parents.push(petKey);
    }
    window.PetMutationLab.currentSelectedParents = parents;

    // Update parent chips UI
    document.querySelectorAll('.parent-chip').forEach(el => {
      const pk = el.getAttribute('data-pet');
      el.classList.toggle('selected', parents.includes(pk));
    });
    const countBadge = document.getElementById('parents-count-badge');
    if (countBadge) countBadge.textContent = `${parents.length}/3`;

    playSynthSound('bubble');
    renderTraitSelectors();
    updateLivePreview();
  }

  function renderTraitSelectors() {
    const container = document.getElementById('traits-container');
    if (!container) return;
    container.innerHTML = '';

    const parents = window.PetMutationLab.currentSelectedParents;
    const currentTraits = window.PetMutationLab.currentTraits;

    // For each trait category, prioritize parent traits, but also allow exotic catalog options
    Object.keys(TRAIT_CATALOG).forEach(catKey => {
      const cat = TRAIT_CATALOG[catKey];
      const wrap = document.createElement('div');
      wrap.className = 'trait-category-block';

      // Collect available options: parent options first, then rest
      const parentOptionIds = new Set();
      parents.forEach(pk => {
        const p = PET_ROSTER[pk];
        if (p && p.traits[catKey]) parentOptionIds.add(p.traits[catKey]);
      });

      wrap.innerHTML = `
        <label class="trait-cat-label">${cat.label}:</label>
        <div class="trait-pills-row">
          ${cat.options.map(opt => {
            const isParentTrait = parentOptionIds.has(opt.id);
            const isSelected = currentTraits[catKey] === opt.id;
            return `
              <button type="button" 
                      class="trait-pill ${isSelected ? 'active' : ''} ${isParentTrait ? 'parent-derived' : ''}" 
                      onclick="window.PetMutationLab.setTrait('${catKey}', '${opt.id}')">
                ${isParentTrait ? '★ ' : ''}${opt.label}
              </button>
            `;
          }).join('')}
        </div>
      `;
      container.appendChild(wrap);
    });
  }

  function setTrait(catKey, optId) {
    window.PetMutationLab.currentTraits[catKey] = optId;
    renderTraitSelectors();
    updateLivePreview();
    playSynthSound('bubble');
  }

  function updateLivePreview() {
    const specimen = document.getElementById('chamber-specimen');
    if (!specimen) return;
    const traits = window.PetMutationLab.currentTraits;
    specimen.innerHTML = renderHybridPetSVG(traits, 120);
  }

  function randomizeName() {
    const parents = window.PetMutationLab.currentSelectedParents;
    const p1 = PET_ROSTER[parents[0]] || PET_ROSTER.dragon;
    const p2 = PET_ROSTER[parents[1]] || PET_ROSTER.cat;
    const p3 = parents[2] ? PET_ROSTER[parents[2]] : null;

    const prefixes = ['Neo', 'Cyber', 'Toxic', 'Aether', 'Astral', 'Bio', 'Shadow', 'Frost', 'Omega', 'Chrono', 'Hyper'];
    const roots = [p1.name, p2.name, p3 ? p3.name : '', 'Draco', 'Chimera', 'Neko', 'Beast', 'Visor', 'Vortex', 'Fang', 'Spark'];
    const suffixes = ['Prime', 'Lord', 'MK-II', 'X', 'Titan', 'Specter', 'Vanguard', 'Champion'];

    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const r1 = roots[Math.floor(Math.random() * roots.length)];
    const r2 = roots[Math.floor(Math.random() * roots.length)];
    const s = suffixes[Math.floor(Math.random() * suffixes.length)];

    let name = `${p} ${r1}-${r2} ${s}`.trim();
    if (name.length > 24) name = `${p} ${r1} ${s}`;

    const input = document.getElementById('mutant-name-input');
    if (input) input.value = name;
    playSynthSound('bubble');
  }

  function performMutation() {
    const btn = document.getElementById('btn-initiate-mutation');
    const nameInput = document.getElementById('mutant-name-input');
    const finalName = (nameInput && nameInput.value.trim()) || 'Synthetic Chimera';

    // Disable button & trigger cinematic sequence
    if (btn) btn.disabled = true;
    playSynthSound('mutate');

    const chamber = document.querySelector('.chamber-glass-tube');
    if (chamber) chamber.classList.add('chamber-mutating');

    const tag = document.getElementById('chamber-status-tag');
    if (tag) {
      tag.textContent = '⚡ GENE FUSION IN PROGRESS ⚡';
      tag.style.color = '#39ff14';
    }

    setTimeout(() => {
      if (chamber) chamber.classList.remove('chamber-mutating');
      playSynthSound('victory');

      const mutant = {
        id: `mutant_${Date.now()}`,
        name: finalName,
        parents: [...window.PetMutationLab.currentSelectedParents],
        traits: { ...window.PetMutationLab.currentTraits },
        createdAt: Date.now()
      };

      saveMutatedPet(mutant);
      // Auto-set as active companion so it immediately appears everywhere!
      localStorage.setItem('activeCompanion', mutant.id);

      const successCard = document.getElementById('mutation-success-card');
      if (successCard) {
        successCard.style.display = 'block';
        successCard.innerHTML = `
          <div style="font-size: 1.1rem; font-weight: 800; color: #39ff14; margin-bottom: 6px;">🎉 SUCCESSFUL MUTATION!</div>
          <div style="font-size: 0.95rem; color: #fff; margin-bottom: 10px;">${finalName} is now alive, saved to your companion roster, and ready for Pet Room & Arcade Chess!</div>
          <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
            <button onclick="document.getElementById('pet-mutation-modal').remove(); if(window.spawnPet) window.spawnPet('${mutant.id}');" style="padding: 8px 16px; border-radius: 9999px; background: #39ff14; color: #022c22; font-weight: 800; border: none; cursor: pointer;">Deploy Screen Mascot</button>
            <a href="games.html" style="text-decoration:none;"><button style="padding: 8px 16px; border-radius: 9999px; background: #38bdf8; color: #082f49; font-weight: 800; border: none; cursor: pointer;">Challenge in Chess</button></a>
            <a href="room.html" style="text-decoration:none;"><button style="padding: 8px 16px; border-radius: 9999px; background: #c084fc; color: #2e1065; font-weight: 800; border: none; cursor: pointer;">Visit Pet Room</button></a>
          </div>
        `;
      }
      if (btn) btn.disabled = false;
    }, 1800);
  }

  // 7. INJECT DRIPPY NEON GREEN & MUTATION STYLES
  if (typeof document !== 'undefined' && document.head && document.createElement) {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
    /* Mutation Modal Overlay */
    .mutation-modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(4, 7, 16, 0.88);
      backdrop-filter: blur(16px);
      z-index: 1000000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      overflow-y: auto;
      font-family: 'Outfit', sans-serif;
    }
    .mutation-modal-card {
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(6, 78, 59, 0.25));
      border: 1px solid rgba(57, 255, 20, 0.4);
      border-radius: 28px;
      max-width: 960px;
      width: 100%;
      padding: 30px;
      color: white;
      box-shadow: 0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(57, 255, 20, 0.2);
      position: relative;
    }
    .mutation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .mutation-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 800;
      color: #39ff14;
      background: rgba(57, 255, 20, 0.12);
      border: 1px solid rgba(57, 255, 20, 0.4);
      box-shadow: 0 0 10px rgba(57, 255, 20, 0.3);
    }
    .mutation-close-btn {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      color: #fff;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      font-weight: 800;
      transition: all 0.2s;
    }
    .mutation-close-btn:hover {
      background: #ef4444;
      border-color: #ef4444;
    }
    .mutation-title {
      font-size: 2rem;
      font-weight: 800;
      margin: 0 0 4px 0;
      background: linear-gradient(135deg, #ffffff, #39ff14);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .mutation-subtitle {
      color: #94a3b8;
      font-size: 0.92rem;
      margin: 0 0 20px 0;
    }
    .mutation-lab-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 24px;
    }
    @media (max-width: 860px) {
      .mutation-lab-grid {
        grid-template-columns: 1fr;
      }
    }
    .mutation-section {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 18px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .section-heading {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1rem;
      font-weight: 800;
      color: #e2e8f0;
      margin-bottom: 12px;
    }
    .step-num {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #39ff14;
      color: #022c22;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.78rem;
      font-weight: 900;
    }
    .count-badge {
      margin-left: auto;
      background: rgba(57, 255, 20, 0.2);
      border: 1px solid #39ff14;
      color: #39ff14;
      font-size: 0.75rem;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 9999px;
    }
    .parents-picker-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(105px, 1fr));
      gap: 8px;
      max-height: 140px;
      overflow-y: auto;
      padding-right: 4px;
    }
    .parent-chip {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      padding: 6px 8px;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      font-size: 0.82rem;
      transition: all 0.2s;
    }
    .parent-chip:hover {
      background: rgba(255, 255, 255, 0.12);
    }
    .parent-chip.selected {
      background: rgba(57, 255, 20, 0.2);
      border-color: #39ff14;
      box-shadow: 0 0 10px rgba(57, 255, 20, 0.4);
    }
    .traits-container {
      max-height: 240px;
      overflow-y: auto;
      padding-right: 6px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .trait-cat-label {
      font-size: 0.8rem;
      font-weight: 700;
      color: #94a3b8;
      display: block;
      margin-bottom: 6px;
    }
    .trait-pills-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .trait-pill {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      border-radius: 8px;
      padding: 4px 10px;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }
    .trait-pill:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }
    .trait-pill.active {
      background: #39ff14;
      color: #052e16;
      border-color: #39ff14;
      font-weight: 800;
      box-shadow: 0 0 8px rgba(57, 255, 20, 0.6);
    }
    .trait-pill.parent-derived {
      border-color: rgba(57, 255, 20, 0.4);
    }
    .name-input-row {
      display: flex;
      gap: 8px;
    }
    .mutant-name-field {
      flex: 1;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(57, 255, 20, 0.4);
      border-radius: 12px;
      padding: 10px 14px;
      color: #fff;
      font-family: inherit;
      font-size: 0.95rem;
      font-weight: 700;
      outline: none;
    }
    .mutant-name-field:focus {
      border-color: #39ff14;
      box-shadow: 0 0 12px rgba(57, 255, 20, 0.4);
    }
    .btn-random-name {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      padding: 0 14px;
      border-radius: 12px;
      font-weight: 700;
      cursor: pointer;
    }

    /* Bio-Chamber Preview */
    .bio-chamber-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 20px;
    }
    .chamber-glass-tube {
      width: 100%;
      height: 240px;
      background: radial-gradient(circle at center, rgba(34, 197, 94, 0.15) 0%, rgba(4, 30, 20, 0.8) 100%);
      border: 2px solid rgba(57, 255, 20, 0.5);
      border-radius: 30px;
      box-shadow: inset 0 0 30px rgba(57, 255, 20, 0.3), 0 0 20px rgba(57, 255, 20, 0.2);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    .chamber-mutating {
      animation: chamber-lightning 0.3s infinite alternate;
    }
    @keyframes chamber-lightning {
      0% { filter: brightness(1.2) drop-shadow(0 0 20px #39ff14); }
      100% { filter: brightness(2) drop-shadow(0 0 40px #22c55e); background: rgba(57, 255, 20, 0.4); }
    }
    .chamber-status-tag {
      position: absolute;
      bottom: 12px;
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #86efac;
      background: rgba(0, 0, 0, 0.6);
      padding: 2px 10px;
      border-radius: 9999px;
      border: 1px solid rgba(57, 255, 20, 0.3);
    }
    .chamber-pedestal {
      width: 70%;
      height: 12px;
      background: linear-gradient(180deg, #1e293b, #0f172a);
      border: 1px solid rgba(57, 255, 20, 0.4);
      border-radius: 0 0 12px 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.6);
    }

    /* =======================================================
       THE DRIPPY NEON GREEN MUTATE BUTTON (Distinct Aesthetic)
       ======================================================= */
    .drippy-button-wrapper {
      position: relative;
      margin-top: 10px;
      padding-bottom: 24px;
    }
    .drippy-neon-green-btn {
      width: 100%;
      padding: 16px 20px;
      border-radius: 20px;
      border: 2px solid #39ff14;
      background: linear-gradient(180deg, #4ade80 0%, #22c55e 40%, #15803d 85%, #052e16 100%);
      color: #022c22;
      font-family: inherit;
      font-size: 1.05rem;
      font-weight: 900;
      letter-spacing: 0.06em;
      cursor: pointer;
      position: relative;
      z-index: 10;
      box-shadow: 0 0 25px rgba(57, 255, 20, 0.8), 0 0 50px rgba(34, 197, 94, 0.4), inset 0 2px 0 rgba(255,255,255,0.7);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      text-shadow: 0 1px 2px rgba(255,255,255,0.6);
    }
    .drippy-neon-green-btn:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 0 35px #39ff14, 0 0 70px rgba(57, 255, 20, 0.7), inset 0 2px 0 #ffffff;
      background: linear-gradient(180deg, #86efac 0%, #39ff14 40%, #16a34a 85%, #052e16 100%);
    }
    .drippy-neon-green-btn:active {
      transform: translateY(1px);
    }
    .btn-glow-pulse {
      position: absolute;
      top: -4px; left: -4px; right: -4px; bottom: -4px;
      border-radius: 24px;
      border: 2px dashed #39ff14;
      opacity: 0.6;
      animation: neon-btn-pulse 1.8s infinite linear;
      pointer-events: none;
    }
    @keyframes neon-btn-pulse {
      0% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(1.04); opacity: 0.2; }
      100% { transform: scale(1); opacity: 0.6; }
    }
    /* Dripping slime stalactites below the button */
    .slime-drip-rack {
      position: absolute;
      bottom: 10px;
      left: 10%;
      width: 80%;
      height: 20px;
      display: flex;
      justify-content: space-around;
      pointer-events: none;
      z-index: 9;
    }
    .slime-drop {
      background: #39ff14;
      border-radius: 0 0 10px 10px;
      width: 10px;
      box-shadow: 0 4px 10px #39ff14;
      animation: slime-elongate 2s infinite ease-in-out;
    }
    .drop-1 { height: 12px; animation-delay: 0s; }
    .drop-2 { height: 20px; animation-delay: 0.4s; }
    .drop-3 { height: 14px; animation-delay: 0.8s; }
    .drop-4 { height: 22px; animation-delay: 0.3s; }
    .drop-5 { height: 16px; animation-delay: 0.7s; }

    @keyframes slime-elongate {
      0%, 100% { transform: scaleY(1); opacity: 0.95; }
      50% { transform: scaleY(1.6) translateY(2px); opacity: 0.7; }
    }

    .mutation-success-card {
      margin-top: 15px;
      background: rgba(6, 78, 59, 0.4);
      border: 1px solid #39ff14;
      border-radius: 16px;
      padding: 16px;
      text-align: center;
      animation: panelFadeIn 0.3s ease;
    }
  `;
    document.head.appendChild(styleEl);
  }

  // Expose API
  global.PetMutationLab = {
    PET_ROSTER,
    TRAIT_CATALOG,
    getMutatedPets,
    saveMutatedPet,
    deleteMutatedPet,
    renderHybridPetSVG,
    openMutationLabModal,
    toggleParent,
    setTrait,
    updateLivePreview,
    randomizeName,
    performMutation,
    playSynthSound
  };

})(window);
