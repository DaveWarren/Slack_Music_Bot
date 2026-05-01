import test from "node:test";
import assert from "node:assert/strict";
import { generateLocalTheme, isWeekendTheme } from "../src/themeGenerator.js";

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
