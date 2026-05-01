import test from "node:test";
import assert from "node:assert/strict";
import { shouldPickThemeFromMention } from "../src/slackInteractionServer.js";

test("recognizes reminder-style theme requests", () => {
  assert.equal(shouldPickThemeFromMention("<@U123> pick a theme"), true);
  assert.equal(shouldPickThemeFromMention("<@U123> pick music"), true);
  assert.equal(shouldPickThemeFromMention("<@U123> choose a song prompt"), true);
});

test("ignores unrelated mentions", () => {
  assert.equal(shouldPickThemeFromMention("<@U123> hello"), false);
  assert.equal(shouldPickThemeFromMention("<@U123> pick someone"), false);
});
