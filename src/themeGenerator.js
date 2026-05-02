// Keep enough generated prompt history to avoid obvious repeats in samples and posts.
const historyLimit = 90;

// Avoid reusing any of the most recent N categories when other categories are available.
const categoryCooldown = 2;

// Hand-written prompts that do not fit a generated pattern.
const fixedThemes = [
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
  "Share a song that should be longer than it is.",
  "Share a song you wish you could hear again for the first time.",
  "Share a song that always starts a conversation.",
  "Share a song you associate with a specific place.",
  "Share a song that changed your mind about an artist.",
  "Share a song that sounds expensive.",
  "Share a song that sounds like trouble.",
  "Share a song that makes time slow down.",
  "Share a song that should have been a bigger hit.",
  "Share a song you only recently appreciated.",
  "Share a song that reminds you of a night out.",
  "Share a song that makes you want to call someone.",
  "Share a song you would put in a time capsule.",
  "Share a song that feels like a secret.",
  "Share a song with a perfect final minute.",
  "Share a song with a perfect first 10 seconds.",
  "Share a song where the live version is best.",
  "Share a song that proves the album is worth hearing.",
  "Share a song that feels cinematic.",
  "Share a song with an amazing drum sound.",
  "Share a song you would defend forever.",
  "Share a song that sounds like bad decisions.",
  "Share a song that makes you feel cooler than you are.",
  "Share a song that belongs in a montage.",
  "Share a song you forgot you loved.",
  "Share a song that makes you miss being younger.",
  "Share a song you discovered through a friend.",
  "Share a song with a feature verse that steals the show.",
  "Share a song that sounds like a victory lap.",
  "Share a song that feels like a confession.",
  "Share a song that should close every party."
];

const fridayOnlyThemes = [
  "Share a song for the weekend.",
  "Share a song that sounds like Friday night.",
  "Share a song to start the weekend properly.",
  "Share a song for leaving work on a Friday.",
  "Share a song that feels like switching your out-of-office on.",
  "Share a song for Friday drinks.",
  "Share a song for the first hour of the weekend.",
  "Share a song that belongs on a Friday night playlist.",
  "Share a song for getting ready on a Friday.",
  "Share a song that sounds like payday Friday.",
  "Share a song for a Friday evening train home.",
  "Share a song that turns a Friday around.",
  "Share a song for dancing into the weekend.",
  "Share a song that feels like clocking off.",
  "Share a song for a lazy Saturday morning, queued up on Friday.",
  "Share a song that makes Friday feel official.",
  "Share a song for the walk home on Friday.",
  "Share a song for a big Friday night in.",
  "Share a song for a big Friday night out.",
  "Share a song that sounds like the weekend starting early."
];

const bandThemes = [
  "Share a song by a band fronted by a female singer.",
  "Share a song by a band that broke up too soon.",
  "Share a song by a band with relatives in it.",
  "Share a song by a band made up of siblings.",
  "Share a song by a band with a brilliant drummer.",
  "Share a song by a band whose name starts with The.",
  "Share a song by a band that changed lead singer.",
  "Share a song by a band that sounds better live.",
  "Share a song by a band that made one perfect album.",
  "Share a song by a band with three or more singers.",
  "Share a song by a band that should reunite.",
  "Share a song by a band that should have stayed broken up.",
  "Share a song by a band from your hometown or nearest city.",
  "Share a song by a band with a great keyboard player.",
  "Share a song by a band with a ridiculous name.",
  "Share a song by a band whose members clearly loved drama.",
  "Share a song by a band where the bassist steals the show.",
  "Share a song by a band that only needed one hit to be remembered.",
  "Share a song by a band that kept getting better with age.",
  "Share a song by a band whose side project was also great.",
  "Share a song by a band with a famous producer.",
  "Share a song by a band that became massive after changing its name.",
  "Share a song by a band with a perfect debut single.",
  "Share a song by a band that deserved a bigger crowd.",
  "Share a song by a band you wish you had seen live."
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
  "triumphant",
  "invincible",
  "heartbroken",
  "reckless",
  "peaceful",
  "homesick",
  "electric",
  "defiant",
  "romantic",
  "bittersweet",
  "fearless",
  "wistful",
  "giddy",
  "focused",
  "weightless",
  "feral",
  "tender",
  "furious",
  "dreamy",
  "alive",
  "unbothered",
  "sentimental",
  "mysterious",
  "playful",
  "resilient",
  "curious",
  "glamorous",
  "lonely",
  "optimistic",
  "chaotic"
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
  "dancing in the kitchen",
  "packing for a holiday",
  "waiting for someone at a station",
  "watching the sun come up",
  "walking home after midnight",
  "getting over a breakup",
  "celebrating tiny victories",
  "starting a new job",
  "missing an old friend",
  "staying in on purpose",
  "taking the scenic route",
  "getting ready for a big night",
  "making breakfast on a day off",
  "escaping a bad mood",
  "sitting by the window",
  "driving through your hometown",
  "walking into a room with confidence",
  "doing absolutely nothing",
  "remembering a brilliant holiday"
];

const eras = ["60s", "70s", "80s", "90s", "00s", "2010s"];
const years = Array.from({ length: 2025 - 1960 + 1 }, (_, index) => 1960 + index);
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
  "the end credits of your life",
  "the first drink after work",
  "a text you were hoping to get",
  "the lights going down before a gig",
  "the first five minutes of a party",
  "a city you have not visited yet",
  "an empty road at night",
  "a beach after everyone has left",
  "a perfect afternoon nap",
  "the walk to meet someone new",
  "the moment the chorus hits",
  "a goodbye you were not ready for",
  "a kitchen full of friends",
  "a train platform in winter",
  "a summer evening that lasts forever",
  "the credits after a great film",
  "a small win on a difficult day",
  "a room full of people singing along",
  "the first day after a deadline",
  "a night you did not want to end"
];

// Each category has a weight for how often it should be chosen relative to others.
// `themes` is a function so generated categories are rebuilt from the latest source lists.
const categoryDefinitions = [
  {
    id: "fixed",
    weight: 3,
    themes: () => fixedThemes
  },
  {
    id: "mood",
    weight: 2,
    themes: () => [
      ...moods.map((mood) => `Share a song that makes you feel ${mood}.`),
      ...moods.map(
        (mood) => `Share a song you would play for someone who needs to feel ${mood}.`
      )
    ]
  },
  {
    id: "situation",
    weight: 3,
    themes: () => [
      ...situations.map((situation) => `Share a song for ${situation}.`),
      ...situations.map(
        (situation) => `Share a song that would soundtrack ${situation}.`
      ),
      ...moments.map((moment) => `Share a song for ${moment}.`),
      ...moments.map((moment) => `Share a song that sounds like ${moment}.`)
    ]
  },
  {
    id: "era",
    weight: 2,
    themes: () => [
      ...eras.map((era) => `Share one of the best songs from the ${era}.`),
      ...eras.map((era) => `Share a song from the ${era} that still sounds fresh.`)
    ]
  },
  {
    id: "genre",
    weight: 2,
    themes: () => [
      ...genres.map((genre) => `Share ${articleFor(genre)} ${genre} song everyone should hear.`),
      ...genres.map((genre) => `Share ${articleFor(genre)} ${genre} song that surprised you.`)
    ]
  },
  {
    id: "album_track",
    weight: 2,
    themes: () => [
      ...albumTrackNumbers.map(
        (trackNumber) => `Share the best track ${trackNumber} from any album you love.`
      ),
      "Share the best first song on an album.",
      "Share the best opening track from any album.",
      "Share the best closing track from any album."
    ]
  },
  {
    id: "band",
    weight: 2,
    themes: () => bandThemes
  },
  {
    id: "letter",
    weight: 1,
    themes: () =>
      letters.map((letter) => `Share the best song you know that starts with ${letter}.`)
  },
  {
    id: "year",
    weight: 1,
    themes: () => years.map((year) => `Share the best song from ${year}.`)
  },
  {
    id: "instrumental",
    weight: 1,
    themes: () => [
      "Share the best instrumental song you know.",
      "Share the best song you know that has no lyrics.",
      "Share a wordless song that still says everything."
    ]
  },
  {
    id: "number_title",
    weight: 1,
    themes: () => [
      "Share the best song with a number in the title.",
      "Share a song with an age in the title.",
      "Share a song with a year in the title.",
      "Share a song with a single digit in the title."
    ]
  },
  {
    id: "weekend",
    weight: 1,
    onlyFriday: true,
    themes: () => fridayOnlyThemes
  }
];

export async function generateTheme(options = {}) {
  return generateThemeChoice(options).theme;
}

// Pick one fresh theme and return both the prompt and the category it came from.
export function generateThemeChoice({
  now = new Date(),
  previousThemes = [],
  previousCategories = [],
  rng = Math.random
} = {}) {
  // Normalize previous prompts so punctuation/case changes do not allow duplicates.
  const previous = new Set(previousThemes.map(normalizeForComparison));
  const recentCategories = new Set(previousCategories.slice(0, categoryCooldown));

  // Remove recently used themes from each category before choosing.
  let categories = getAvailableCategories(now).map((category) => ({
    ...category,
    freshThemes: category.themes.filter(
      (theme) => !previous.has(normalizeForComparison(theme))
    )
  }));

  // If every prompt has been used recently, reset back to the full available pool.
  categories = categories.filter((category) => category.freshThemes.length > 0);
  if (categories.length === 0) {
    categories = getAvailableCategories(now).map((category) => ({
      ...category,
      freshThemes: category.themes
    }));
  }

  // Prefer categories outside the cooldown window, but fall back if needed.
  const cooledCategories = categories.filter(
    (category) => !recentCategories.has(category.id)
  );
  if (cooledCategories.length > 0) {
    categories = cooledCategories;
  }

  const category = weightedPick(categories, rng);
  return {
    theme: pick(category.freshThemes, rng),
    category: category.id
  };
}

// Backwards-compatible alias used by the posting code.
export function generateLocalTheme(options = {}) {
  return generateThemeChoice(options).theme;
}

// Generate a run of prompts while simulating recent history between picks.
export function generateSampleThemes({ count = 100, now = new Date() } = {}) {
  const themes = [];
  const recentThemes = [];
  const recentCategories = [];

  while (themes.length < count) {
    const choice = generateThemeChoice({
      now,
      previousThemes: recentThemes,
      previousCategories: recentCategories
    });

    themes.push(choice.theme);
    recentThemes.unshift(choice.theme);
    recentCategories.unshift(choice.category);
    recentThemes.length = Math.min(recentThemes.length, historyLimit);
    recentCategories.length = Math.min(recentCategories.length, historyLimit);
  }

  return themes;
}

// Expose the full prompt pool for tests and diagnostics.
export function getThemePool({ now = new Date() } = {}) {
  return getAvailableCategories(now).flatMap((category) => category.themes);
}

// Expose category metadata without leaking the full prompt lists.
export function getThemeCategories({ now = new Date() } = {}) {
  return getAvailableCategories(now).map(({ id, weight, themes }) => ({
    id,
    weight,
    count: themes.length
  }));
}

// Weekend prompts should only be available on Fridays.
export function isWeekendTheme(theme) {
  return /\bweekend\b|\bfriday\b/i.test(theme);
}

// Apply day-based category rules and expand generated theme lists.
function getAvailableCategories(now) {
  return categoryDefinitions
    .filter((category) => !category.onlyFriday || isFriday(now))
    .map((category) => ({
      id: category.id,
      weight: category.weight,
      themes: category.themes()
    }));
}

function isFriday(date) {
  return date.getDay() === 5;
}

// Pick a single item uniformly from a list.
function pick(items, rng = Math.random) {
  return items[Math.floor(rng() * items.length)];
}

// Pick a category according to its relative weight.
function weightedPick(items, rng = Math.random) {
  const totalWeight = items.reduce((total, item) => total + item.weight, 0);
  let threshold = rng() * totalWeight;

  for (const item of items) {
    threshold -= item.weight;
    if (threshold < 0) {
      return item;
    }
  }

  return items.at(-1);
}

// Make prompt text safe for repeat detection.
function normalizeForComparison(theme) {
  return theme.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

// Keep generated genre prompts grammatical: "a rock song", "an R&B song".
function articleFor(word) {
  return /^[aeiou]/i.test(word) || word === "R&B" ? "an" : "a";
}
