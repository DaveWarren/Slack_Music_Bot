import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { loadDotEnv } from "../src/dotenv.js";

test("loads env values without overwriting existing process values", async () => {
  const dir = await mkdtemp(join(tmpdir(), "music-bot-env-"));
  const path = join(dir, ".env");
  const env = { EXISTING: "kept" };

  try {
    await writeFile(
      path,
      [
        "# comment",
        "SLACK_CHANNEL_ID=C123",
        "PROMPT_STYLE='bright and odd'",
        "EXISTING=replaced"
      ].join("\n")
    );

    await loadDotEnv(path, env);

    assert.equal(env.SLACK_CHANNEL_ID, "C123");
    assert.equal(env.PROMPT_STYLE, "bright and odd");
    assert.equal(env.EXISTING, "kept");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
