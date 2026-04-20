// Procedural Lore & Choice Generator

export function getRandomLore() {
  const subjects = [
    "knight", "scholar", "child", "priest", "wanderer", "king", "thief", "oracle",
    "sculptor", "musician", "soldier", "merchant", "astronomer", "healer"
  ];
  const adjectives = [
    "blinded", "broken", "weeping", "cursed", "forgotten", "golden", "shadowed",
    "shivering", "furious", "silent", "burning", "hollow", "betrayed"
  ];
  const actions = [
    "who betrayed their kin.",
    "seeking the eternal dawn.",
    "lost in the labyrinth of time.",
    "who stared too long into the void.",
    "clutching a shattered memory.",
    "whispering a forbidden name.",
    "punished for stealing a fragment of light.",
    "waiting for an apology that will never come.",
    "dreaming of a world that no longer exists.",
    "who bartered their eyes for wisdom."
  ];

  // Plentiful combinations (14 * 13 * 10 = 1,820 variations)
  const s = subjects[Math.floor(Math.random() * subjects.length)];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const act = actions[Math.floor(Math.random() * actions.length)];
  
  return `The soul of a ${adj} ${s} ${act}`;
}

export const choicePool = [
  { text: "Sacrifice Vitality to Save (Lose 40 HP)", effect: "hp_loss_heavy", moral: +2 },
  { text: "Absorb to Restore Power (Full Heal)", effect: "full_heal", moral: -2 },
  { text: "Offer an Ember (Lose 30 Light)", effect: "light_loss", moral: +1 },
  { text: "Drain its remaining glow (+50 Light)", effect: "light_gain", moral: -1 },
  { text: "Bind it to the Void (-10 Max HP)", effect: "max_hp_loss", moral: -2 },
  { text: "Share a memory (+10 Max Light)", effect: "max_light_gain", moral: +1 },
  { text: "Weep for them (No mechanical change)", effect: "none", moral: +1 },
  { text: "Consume its essence (+20 Max HP)", effect: "max_hp_gain", moral: -3 },
  { text: "Guide it to peace (-10 HP, -10 Light)", effect: "small_drain", moral: +2 },
  { text: "Crush it (Rapid Light drain for next 5s)", effect: "light_drain_curse", moral: -3 },
  { text: "Sing to it (Fully refilled Light)", effect: "full_light", moral: +2 },
  { text: "Demand its secrets (+10 Max Light, -20 HP)", effect: "trade_hp_for_max_light", moral: -1 },
  { text: "Offer your blood (-20 Max HP, Full Heal)", effect: "blood_sacrifice", moral: 0 },
  { text: "Ignore the soul", effect: "none", moral: 0 },
  { text: "Promise redemption (Companion glow +)", effect: "none", moral: +1 }
];

export function getRandomChoices(count) {
  // Shuffle the choice pool and pick 'count' items
  const shuffled = [...choicePool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function applyChoiceOption(state, choice) {
  // Apply moral shift
  state.moral += choice.moral;

  // Apply mechanical effects
  switch (choice.effect) {
    case "hp_loss_heavy":
      state.health -= 40;
      break;
    case "full_heal":
      state.health = state.maxHealth;
      break;
    case "light_loss":
      state.lightEnergy -= 30;
      break;
    case "light_gain":
      state.lightEnergy += 50;
      break;
    case "max_hp_loss":
      state.maxHealth -= 10;
      if (state.health > state.maxHealth) state.health = state.maxHealth;
      break;
    case "max_light_gain":
      state.maxLightEnergy += 10;
      break;
    case "max_hp_gain":
      state.maxHealth += 20;
      state.health += 20;
      break;
    case "small_drain":
      state.health -= 10;
      state.lightEnergy -= 10;
      break;
    case "light_drain_curse":
      // A simple implementation: instantly halve light energy
      state.lightEnergy /= 2;
      break;
    case "full_light":
      state.lightEnergy = state.maxLightEnergy;
      break;
    case "trade_hp_for_max_light":
      state.health -= 20;
      state.maxLightEnergy += 10;
      break;
    case "blood_sacrifice":
      state.maxHealth -= 20;
      if (state.maxHealth < 10) state.maxHealth = 10;
      state.health = state.maxHealth;
      break;
    case "none":
    default:
      // nothing
      break;
  }

  // Bounds checks
  if (state.health < 0) state.health = 0;
  if (state.health > state.maxHealth) state.health = state.maxHealth;
  if (state.lightEnergy < 0) state.lightEnergy = 0;
  if (state.lightEnergy > state.maxLightEnergy) state.lightEnergy = state.maxLightEnergy;
}
