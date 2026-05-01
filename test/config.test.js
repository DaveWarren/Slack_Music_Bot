import test from "node:test";
import assert from "node:assert/strict";
import { loadConfig } from "../src/config.js";

test("loads Azure AI configuration", () => {
  const config = loadConfig({
    SLACK_BOT_TOKEN: "xoxb-test",
    SLACK_CHANNEL_ID: "C123",
    AZURE_AI_ENDPOINT: "https://example.services.ai.azure.com",
    AZURE_AI_API_KEY: "azure-test-key"
  });

  assert.equal(config.azureAiEndpoint, "https://example.services.ai.azure.com");
  assert.equal(config.azureAiApiKey, "azure-test-key");
  assert.equal(config.azureAiModel, "gpt-4o-mini");
  assert.equal(config.azureAiApiVersion, "2024-05-01-preview");
});
