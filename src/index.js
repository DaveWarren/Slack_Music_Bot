import { loadDotEnv } from "./dotenv.js";
import { loadConfig } from "./config.js";
import { dueSlot, nextCheckDelayMs, validateSchedule } from "./scheduler.js";
import { readLastPost, writeLastPost } from "./stateStore.js";
import { generateThemeChoice } from "./themeGenerator.js";
import { formatThemeMessage } from "./messageFormatter.js";
import { postMessage } from "./slackClient.js";
import { startSlashCommandServer } from "./slashCommandServer.js";

await loadDotEnv();
const config = loadConfig();
validateSchedule(config.schedule);
const once = process.argv.includes("--once");
const server = process.argv.includes("--server");

if (server) {
  startSlashCommandServer(config);
} else if (once) {
  await postTheme("manual");
} else {
  console.log(
    `Music theme bot running: ${config.schedule.cadence} schedule for ${config.slackChannelId}`
  );
  await tick();
}

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

async function postTheme(slotKey) {
  const previousState = await readLastPost(config.stateFile);
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
