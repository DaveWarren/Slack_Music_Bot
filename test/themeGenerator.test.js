import test from "node:test";
import assert from "node:assert/strict";
import { isUsableTheme } from "../src/themeGenerator.js";

test("accepts a complete share prompt", () => {
  assert.equal(
    isUsableTheme("Share a Spotify link to a cover version that beats the original."),
    true
  );
});

test("rejects short truncated output", () => {
  assert.equal(isUsableTheme("What's the"), false);
});

test("rejects prompts that do not start with Share", () => {
  assert.equal(isUsableTheme("What song reminds you of summer evenings?"), false);
});

test("rejects sentence fragments", () => {
  assert.equal(isUsableTheme("Share a song that reminds you of the"), false);
});
