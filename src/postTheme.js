import { readLastPost, writeLastPost } from "./stateStore.js";
import { generateThemeChoice } from "./themeGenerator.js";
import { formatThemeMessage } from "./messageFormatter.js";
import { postMessage } from "./slackClient.js";

// Pick a theme using recent history, post it to Slack, and save the result.
export async function postTheme(config, slotKey = "manual") {
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

  return {
    slotKey,
    theme: choice.theme,
    category: choice.category,
    slackTs: slackResponse.ts,
    postedAt
  };
}
