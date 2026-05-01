import test from "node:test";
import assert from "node:assert/strict";
import { loadConfig } from "../src/config.js";

test("loads Gemini configuration", () => {
  const config = loadConfig({
    SLACK_BOT_TOKEN: "xoxb-test",
    SLACK_CHANNEL_ID: "C123",
    GEMINI_API_KEY: "gemini-test-key"
  });

  assert.equal(config.geminiApiKey, "gemini-test-key");
  assert.equal(config.geminiModel, "gemini-2.5-flash");
});
