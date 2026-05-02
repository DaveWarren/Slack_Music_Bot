import { loadDotEnv } from "./dotenv.js";
import { loadConfig } from "./config.js";
import { dueSlot, nextCheckDelayMs, validateSchedule } from "./scheduler.js";
import { readLastPost, writeLastPost } from "./stateStore.js";
import { generateThemeChoice } from "./themeGenerator.js";
import { formatThemeMessage } from "./messageFormatter.js";
import { postMessage } from "./slackClient.js";
import { startSlackInteractionServer } from "./slackInteractionServer.js";

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
  await postTheme("manual");
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
        await postTheme(slot.key);
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    setTimeout(tick, nextCheckDelayMs(new Date(), config.schedule));
  }
}

// Pick a theme using recent history, post it to Slack, and save the result.
async function postTheme(slotKey) {
  const previousState = await readLastPost(config.stateFile);

  // Support both the current `history` shape and older state files with one theme.
  const history =
    previousState?.history ||
    (previousState?.theme
      ? [
          {
            theme: previousState.theme,
            category: previousState.category,
            postedAt: previousState.postedAt
          }
        ]
      : []);

  const choice = generateThemeChoice({
    now: new Date(),
    previousThemes: history.map((entry) => entry.theme),
    previousCategories: history.map((entry) => entry.category).filter(Boolean)
  });

  const slackResponse = await postMessage({
    token: config.slackBotToken,
    channel: config.slackChannelId,
    text: formatThemeMessage(choice.theme)
  });

  // Store a compact history so future runs can avoid repeated prompts/categories.
  const postedAt = new Date().toISOString();
  await writeLastPost(config.stateFile, {
    slotKey,
    theme: choice.theme,
    category: choice.category,
    slackTs: slackResponse.ts,
    postedAt,
    history: [
      {
        theme: choice.theme,
        category: choice.category,
        postedAt
      },
      ...history
    ].slice(0, 90)
  });

  console.log(`Posted theme for ${slotKey} (${choice.category}): ${choice.theme}`);
}
