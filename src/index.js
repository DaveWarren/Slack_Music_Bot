import { loadDotEnv } from "./dotenv.js";
import { loadConfig } from "./config.js";
import { dueSlot, nextCheckDelayMs, validateSchedule } from "./scheduler.js";
import { readLastPost } from "./stateStore.js";
import { startSlackInteractionServer } from "./slackInteractionServer.js";
import { postTheme } from "./postTheme.js";

await loadDotEnv();
const config = loadConfig();
validateSchedule(config.schedule);

// CLI modes:
// --server handles Slack slash commands/events, --once posts immediately,
// otherwise the process stays alive and posts when the schedule is due.
const once = process.argv.includes("--once");
const server = process.argv.includes("--server");

if (server) {
  startSlackInteractionServer(config);
} else if (once) {
  await postTheme(config, "manual");
} else {
  console.log(
    `Music theme bot running: ${config.schedule.cadence} schedule for ${config.slackChannelId}`
  );
  await tick();
}

// Check whether the current schedule slot is due, then sleep until the next check.
async function tick() {
  try {
    const now = new Date();
    const slot = dueSlot(now, config.schedule);

    if (slot) {
      const lastPost = await readLastPost(config.stateFile);
      if (lastPost?.slotKey !== slot.key) {
        await postTheme(config, slot.key);
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    setTimeout(tick, nextCheckDelayMs(new Date(), config.schedule));
  }
}
