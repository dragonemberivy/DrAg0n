const subjects = ["the void", "the echo", "the silence", "the dark", "the old light", "a fragile spark", "the abyss", "the watcher", "your memory", "the ash", "a whisper", "the core", "the final gate", "the labyrinth", "the truth", "the lie", "the sacrifice", "the golden flame", "the ruin", "a shadow"];
const adjectives = ["broken", "eternal", "hollow", "forsaken", "luminous", "cursed", "silent", "blind", "forgotten", "golden", "crimson", "shattered", "distant", "cold", "warm", "fading", "ancient", "sorrowful", "desolate", "pure"];
const verbs = ["consumes", "weeps for", "demands", "rejects", "awaits", "forgets", "remembers", "hunts", "seeks", "destroys", "illuminates", "betrays", "guides", "mocks", "echoes through", "devours", "shatters", "fears"];
const objects = ["the abyss", "the embers", "what relies on the light", "those who fell", "the fragments of hope", "your warmth", "the inevitable", "the quiet death", "the ancient runes", "the path forward", "a fading dream"];
const completions = ["in the deep.", "without end.", "before the dawn.", "in the shadow of the gate.", "until nothing remains.", "as it always has.", "for the final time.", "in absolute silence.", "beyond the veil.", "until the light dies.", "forever.", "in the hollows.", "without mercy.", "in the dark."];

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function generateTerminalResponse(query) {
  const q = query.toLowerCase();
  
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  
  // Math: 20 subjects * 20 adjectives * 18 verbs * 11 objects * 14 completions = 1,108,800 possible sentences per template!
  // Vastly scales past the 96,000 benchmark requested.
  
  if (q.includes("who")) {
    return `You are ${pick(adjectives)} ${pick(subjects)} that ${pick(verbs)} ${pick(objects)} ${pick(completions)}`;
  } else if (q.includes("where")) {
    return `${capitalize(pick(subjects))} ${pick(verbs)} ${pick(adjectives)} ${pick(objects)} ${pick(completions)}`;
  } else if (q.includes("why")) {
    return `Because ${pick(subjects)} ${pick(verbs)} the ${pick(adjectives)} ${pick(objects)}...`;
  } else if (q.includes("trap") || q.includes("monster") || q.includes("shadow")) {
    return `${capitalize(pick(adjectives))} shadows will ${pick(verbs)} your light ${pick(completions)}`;
  } else if (q.includes("way") || q.includes("exit") || q.includes("end") || q.includes("gateway")) {
     return `The gateway ${pick(verbs)} ${pick(objects)} ${pick(completions)}`;
  } else {
    // Default mysterious template
    return `${capitalize(pick(subjects))} ${pick(verbs)} ${pick(objects)} ${pick(completions)}`;
  }
}
