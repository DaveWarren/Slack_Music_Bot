import { loadDotEnv } from "./dotenv.js";
import { loadConfig } from "./config.js";
import { dueSlot, nextCheckDelayMs, validateSchedule } from "./scheduler.js";
import { readLastPost, writeLastPost } from "./stateStore.js";
import { generateTheme } from "./themeGenerator.js";
import { postMessage } from "./slackClient.js";

await loadDotEnv();
const config = loadConfig();
validateSchedule(config.schedule);
const once = process.argv.includes("--once");

if (once) {
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
    apiKey: config.geminiApiKey,
    model: config.geminiModel,
    style: config.promptStyle
  });

  const text = `:musical_note: Today's music theme: ${theme}\n\nDrop a Spotify link in the thread or channel.`;
  const slackResponse = await postMessage({
    token: config.slackBotToken,
    channel: config.slackChannelId,
    text
  });

  await writeLastPost(config.stateFile, {
    slotKey,
    theme,
    slackTs: slackResponse.ts,
    postedAt: new Date().toISOString()
  });

  console.log(`Posted theme for ${slotKey}: ${theme}`);
}
