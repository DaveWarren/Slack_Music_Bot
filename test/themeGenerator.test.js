import test from "node:test";
import assert from "node:assert/strict";
import {
  generateThemeChoice,
  generateLocalTheme,
  getThemeCategories,
  getThemePool,
  isWeekendTheme
} from "../src/themeGenerator.js";

test("generates a local theme", () => {
  const theme = generateLocalTheme({ now: new Date("2026-05-04T09:00:00Z") });

  assert.match(theme, /^Share\b/);
  assert.match(theme, /[.!?]$/);
});

test("does not generate weekend themes before Friday", () => {
  for (let index = 0; index < 500; index += 1) {
    const theme = generateLocalTheme({ now: new Date("2026-05-04T09:00:00Z") });
    assert.equal(isWeekendTheme(theme), false);
  }
});

test("can generate weekend themes on Friday", () => {
  const pool = getThemePool({ now: new Date("2026-05-01T09:00:00Z") });
  const weekendThemes = pool.filter(isWeekendTheme);

  assert.ok(weekendThemes.length >= 15);
  assert.ok(weekendThemes.includes("Share a song for the weekend."));
  assert.ok(weekendThemes.includes("Share a song for leaving work on a Friday."));
});

test("avoids recently used themes when alternatives exist", () => {
  const previousThemes = ["Share your running anthem."];

  for (let index = 0; index < 100; index += 1) {
    const theme = generateLocalTheme({
      now: new Date("2026-05-04T09:00:00Z"),
      previousThemes
    });

    assert.notEqual(theme, "Share your running anthem.");
  }
});

test("includes album track number prompts", () => {
  const pool = getThemePool({ now: new Date("2026-05-04T09:00:00Z") });

  assert.ok(pool.includes("Share the best first song on an album."));
  assert.ok(pool.includes("Share the best track 2 from any album you love."));
  assert.ok(pool.includes("Share the best track 12 from any album you love."));
});

test("includes letter, instrumental, and number title prompts", () => {
  const pool = getThemePool({ now: new Date("2026-05-04T09:00:00Z") });

  assert.ok(pool.includes("Share the best song you know that starts with X."));
  assert.ok(pool.includes("Share the best song you know that has no lyrics."));
  assert.ok(pool.includes("Share the best song with a number in the title."));
});

test("includes year-specific prompts", () => {
  const pool = getThemePool({ now: new Date("2026-05-04T09:00:00Z") });

  assert.ok(pool.includes("Share the best song from 1960."));
  assert.ok(pool.includes("Share the best song from 1984."));
  assert.ok(pool.includes("Share the best song from 2025."));
});

test("theme pool does not contain duplicate prompts", () => {
  const pool = getThemePool({ now: new Date("2026-05-04T09:00:00Z") });

  assert.equal(new Set(pool).size, pool.length);
});

test("exposes balanced categories instead of one flat weighted pool", () => {
  const categories = getThemeCategories({ now: new Date("2026-05-04T09:00:00Z") });
  const byId = Object.fromEntries(categories.map((category) => [category.id, category]));

  assert.equal(byId.year.count, 66);
  assert.equal(byId.letter.count, 26);
  assert.equal(byId.year.weight, 1);
  assert.equal(byId.situation.weight, 3);
  assert.ok(byId.situation.count >= 90);
  assert.ok(byId.mood.count >= 70);
});

test("avoids the most recent category when other categories are available", () => {
  const choice = generateThemeChoice({
    now: new Date("2026-05-04T09:00:00Z"),
    previousCategories: ["year"],
    rng: () => 0.99
  });

  assert.notEqual(choice.category, "year");
});
