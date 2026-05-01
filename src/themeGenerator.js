const fixedThemes = [
  "Share one of the best songs from the 80s.",
  "Share a song you think would make a perfect first dance.",
  "Share a song that gets you out of bed.",
  "Share a song that makes you happy.",
  "Share a song for when it is raining.",
  "Share your running anthem.",
  "Share your favourite song from when you were a kid.",
  "Share a cover version that is better than the original.",
  "Share a song that reminds you of summer.",
  "Share a song that sounds better played loud.",
  "Share a song you know every word to.",
  "Share a song that instantly improves your mood.",
  "Share a song that belongs on a road trip playlist.",
  "Share a song with a brilliant opening line.",
  "Share a song with a bassline you love.",
  "Share a song that reminds you of school.",
  "Share a song that feels like a night out.",
  "Share a song that feels like heading home.",
  "Share a song you discovered through a film or TV show.",
  "Share a song you would put on at a party.",
  "Share a song that makes you nostalgic.",
  "Share a song with an unforgettable chorus.",
  "Share a song that deserves more attention.",
  "Share a song that sounds like pure confidence.",
  "Share a song you would use as entrance music.",
  "Share a song with a great guitar riff.",
  "Share a song that feels like a fresh start.",
  "Share a song that reminds you of someone important.",
  "Share a song you loved before it got popular.",
  "Share a song that should be longer than it is."
];

const fridayOnlyThemes = [
  "Share a song for the weekend.",
  "Share a song that sounds like Friday night.",
  "Share a song to start the weekend properly."
];

const moods = [
  "happy",
  "hopeful",
  "melancholy",
  "unstoppable",
  "calm",
  "dramatic",
  "sunny",
  "restless",
  "ridiculous",
  "triumphant"
];

const situations = [
  "walking in the rain",
  "getting ready to go out",
  "cooking dinner",
  "running up a hill",
  "the first warm day of the year",
  "a late train home",
  "cleaning the house",
  "a long drive",
  "finishing a hard week",
  "dancing in the kitchen"
];

const eras = ["60s", "70s", "80s", "90s", "00s", "2010s"];

const templates = [
  () => `Share a song that makes you feel ${pick(moods)}.`,
  () => `Share a song for ${pick(situations)}.`,
  () => `Share one of the best songs from the ${pick(eras)}.`,
  () => `Share a song from the ${pick(eras)} that still sounds fresh.`,
  () => `Share a song you would play for someone who needs to feel ${pick(moods)}.`,
  () => `Share a song that would soundtrack ${pick(situations)}.`
];

export async function generateTheme({ now = new Date(), previousThemes = [] } = {}) {
  return generateLocalTheme({ now, previousThemes });
}

export function generateLocalTheme({ now = new Date(), previousThemes = [] } = {}) {
  const candidates = [...fixedThemes, ...buildGeneratedThemes()];

  if (isFriday(now)) {
    candidates.push(...fridayOnlyThemes);
  }

  const previous = new Set(previousThemes.map(normalizeForComparison));
  const freshCandidates = candidates.filter(
    (theme) => !previous.has(normalizeForComparison(theme))
  );
  const pool = freshCandidates.length > 0 ? freshCandidates : candidates;

  return pick(pool);
}

export function isWeekendTheme(theme) {
  return /\bweekend\b|\bfriday\b/i.test(theme);
}

function buildGeneratedThemes() {
  return templates.map((template) => template());
}

function isFriday(date) {
  return date.getDay() === 5;
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function normalizeForComparison(theme) {
  return theme.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
