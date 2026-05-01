const validCadences = new Set(["hourly", "daily", "weekly", "interval"]);

export function loadConfig(env = process.env) {
  const cadence = (env.SCHEDULE_CADENCE || "daily").toLowerCase();
  if (!validCadences.has(cadence)) {
    throw new Error(
      `SCHEDULE_CADENCE must be one of: ${Array.from(validCadences).join(", ")}`
    );
  }

  return {
    slackBotToken: required(env.SLACK_BOT_TOKEN, "SLACK_BOT_TOKEN"),
    slackChannelId: required(env.SLACK_CHANNEL_ID, "SLACK_CHANNEL_ID"),
    azureAiEndpoint: required(env.AZURE_AI_ENDPOINT, "AZURE_AI_ENDPOINT"),
    azureAiApiKey: required(env.AZURE_AI_API_KEY, "AZURE_AI_API_KEY"),
    azureAiModel: env.AZURE_AI_MODEL || "gpt-4o-mini",
    azureAiApiVersion: env.AZURE_AI_API_VERSION || "2024-05-01-preview",
    slackSigningSecret: env.SLACK_SIGNING_SECRET,
    slashCommandPath: env.SLASH_COMMAND_PATH || "/slack/commands",
    port: Number.parseInt(env.PORT || "3000", 10),
    promptStyle:
      env.PROMPT_STYLE || "playful, specific, easy for a Slack channel to answer",
    schedule: {
      cadence,
      time: env.SCHEDULE_TIME || "09:00",
      day: (env.SCHEDULE_DAY || "monday").toLowerCase(),
      intervalMinutes: Number.parseInt(env.SCHEDULE_INTERVAL_MINUTES || "60", 10),
      timeZone: env.TZ || "UTC"
    },
    stateFile: env.STATE_FILE || ".state/last-post.json"
  };
}

function required(value, name) {
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}
