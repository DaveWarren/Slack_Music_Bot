import test from "node:test";
import assert from "node:assert/strict";
import {
  generateLocalTheme,
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
  const previousThemes = [
    "Share a song for the weekend.",
    "Share a song that sounds like Friday night."
  ];

  assert.equal(previousThemes.every(isWeekendTheme), true);
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
