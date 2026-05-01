import { loadDotEnv } from "./dotenv.js";
import { loadConfig } from "./config.js";
import { dueSlot, nextCheckDelayMs, validateSchedule } from "./scheduler.js";
import { readLastPost, writeLastPost } from "./stateStore.js";
import { generateTheme } from "./themeGenerator.js";
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
  const theme = await generateTheme({
    endpoint: config.azureAiEndpoint,
    apiKey: config.azureAiApiKey,
    model: config.azureAiModel,
    apiVersion: config.azureAiApiVersion,
    style: config.promptStyle
  });

  const slackResponse = await postMessage({
    token: config.slackBotToken,
    channel: config.slackChannelId,
    text: formatThemeMessage(theme)
  });

  await writeLastPost(config.stateFile, {
    slotKey,
    theme,
    slackTs: slackResponse.ts,
    postedAt: new Date().toISOString()
  });

  console.log(`Posted theme for ${slotKey}: ${theme}`);
}
