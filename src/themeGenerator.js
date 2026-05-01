const historyLimit = 90;
const categoryCooldown = 2;

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
  "Share a song that should be longer than it is."
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
  "the end credits of your life"
];

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

export function generateThemeChoice({
  now = new Date(),
  previousThemes = [],
  previousCategories = [],
  rng = Math.random
} = {}) {
  const previous = new Set(previousThemes.map(normalizeForComparison));
  const recentCategories = new Set(previousCategories.slice(0, categoryCooldown));

  let categories = getAvailableCategories(now).map((category) => ({
    ...category,
    freshThemes: category.themes.filter(
      (theme) => !previous.has(normalizeForComparison(theme))
    )
  }));

  categories = categories.filter((category) => category.freshThemes.length > 0);
  if (categories.length === 0) {
    categories = getAvailableCategories(now).map((category) => ({
      ...category,
      freshThemes: category.themes
    }));
  }

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

export function generateLocalTheme(options = {}) {
  return generateThemeChoice(options).theme;
}

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

export function getThemePool({ now = new Date() } = {}) {
  return getAvailableCategories(now).flatMap((category) => category.themes);
}

export function getThemeCategories({ now = new Date() } = {}) {
  return getAvailableCategories(now).map(({ id, weight, themes }) => ({
    id,
    weight,
    count: themes.length
  }));
}

export function isWeekendTheme(theme) {
  return /\bweekend\b|\bfriday\b/i.test(theme);
}

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

function pick(items, rng = Math.random) {
  return items[Math.floor(rng() * items.length)];
}

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

function normalizeForComparison(theme) {
  return theme.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function articleFor(word) {
  return /^[aeiou]/i.test(word) || word === "R&B" ? "an" : "a";
}
