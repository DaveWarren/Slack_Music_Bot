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
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const albumTrackNumbers = Array.from({ length: 12 }, (_, index) => index + 1);
const genres = [
  "pop",
  "rock",
  "soul",
  "hip hop",
  "dance",
  "indie",
  "punk",
  "disco",
  "folk",
  "R&B",
  "country",
  "electronic"
];

const moments = [
  "a quiet Sunday morning",
  "the last song at a wedding",
  "a train pulling out of the station",
  "a late-night taxi ride",
  "a big personal win",
  "a terrible day turning around",
  "a sunny walk with nowhere to be",
  "a packed dancefloor",
  "a long airport wait",
  "the end credits of your life"
];

const templates = [
  ...moods.map((mood) => () => `Share a song that makes you feel ${mood}.`),
  ...situations.map((situation) => () => `Share a song for ${situation}.`),
  ...eras.map((era) => () => `Share one of the best songs from the ${era}.`),
  ...eras.map((era) => () => `Share a song from the ${era} that still sounds fresh.`),
  ...moods.map(
    (mood) => () => `Share a song you would play for someone who needs to feel ${mood}.`
  ),
  ...situations.map(
    (situation) => () => `Share a song that would soundtrack ${situation}.`
  ),
  ...genres.map((genre) => () => `Share ${articleFor(genre)} ${genre} song everyone should hear.`),
  ...genres.map((genre) => () => `Share ${articleFor(genre)} ${genre} song that surprised you.`),
  ...albumTrackNumbers.map(
    (trackNumber) => () =>
      `Share the best track ${trackNumber} from any album you love.`
  ),
  ...letters.map(
    (letter) => () => `Share the best song you know that starts with ${letter}.`
  ),
  ...moments.map((moment) => () => `Share a song for ${moment}.`),
  ...moments.map((moment) => () => `Share a song that sounds like ${moment}.`),
  () => "Share the best first song on an album.",
  () => "Share the best opening track from any album.",
  () => "Share the best closing track from any album.",
  () => "Share the best instrumental song you know.",
  () => "Share the best song you know that has no lyrics.",
  () => "Share a wordless song that still says everything.",
  () => "Share the best song with a number in the title.",
  () => "Share a song with an age in the title.",
  () => "Share a song with a year in the title.",
  () => "Share a song with a single digit in the title."
];

export async function generateTheme({ now = new Date(), previousThemes = [] } = {}) {
  return generateLocalTheme({ now, previousThemes });
}

export function generateLocalTheme({ now = new Date(), previousThemes = [] } = {}) {
  const candidates = buildThemePool(now);

  const previous = new Set(previousThemes.map(normalizeForComparison));
  const freshCandidates = candidates.filter(
    (theme) => !previous.has(normalizeForComparison(theme))
  );
  const pool = freshCandidates.length > 0 ? freshCandidates : candidates;

  return pick(pool);
}

export function generateSampleThemes({ count = 100, now = new Date() } = {}) {
  const pool = shuffle(buildThemePool(now));
  const samples = [];

  while (samples.length < count) {
    samples.push(pool[samples.length % pool.length]);
  }

  return samples;
}

export function getThemePool({ now = new Date() } = {}) {
  return buildThemePool(now);
}

export function isWeekendTheme(theme) {
  return /\bweekend\b|\bfriday\b/i.test(theme);
}

function buildGeneratedThemes() {
  return templates.map((template) => template());
}

function buildThemePool(now) {
  const candidates = [...fixedThemes, ...buildGeneratedThemes()];

  if (isFriday(now)) {
    candidates.push(...fridayOnlyThemes);
  }

  return candidates;
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

function articleFor(word) {
  return /^[aeiou]/i.test(word) || word === "R&B" ? "an" : "a";
}

function shuffle(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}
