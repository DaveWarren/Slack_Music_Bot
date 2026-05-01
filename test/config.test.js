import test from "node:test";
import assert from "node:assert/strict";
import { loadConfig } from "../src/config.js";

test("loads required Slack configuration without AI API credentials", () => {
  const config = loadConfig({
    SLACK_BOT_TOKEN: "xoxb-test",
    SLACK_CHANNEL_ID: "C123"
  });

  assert.equal(config.slackBotToken, "xoxb-test");
  assert.equal(config.slackChannelId, "C123");
});
