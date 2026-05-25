import { loadDotEnv } from "./dotenv.js";
import { loadConfig } from "./config.js";
import { postTheme } from "./postTheme.js";
import { readLastPost } from "./stateStore.js";

export async function handler(event = {}) {
  await loadDotEnv();

  const config = loadConfig();
  const slotKey = event.slotKey || event.time || new Date().toISOString();
  const previousState = await readLastPost(config.stateFile);

  if (previousState?.slotKey === slotKey) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        skipped: true,
        slotKey
      })
    };
  }

  const result = await postTheme(config, slotKey);

  return {
    statusCode: 200,
    body: JSON.stringify({
      ok: true,
      ...result
    })
  };
}
