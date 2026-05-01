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
    geminiApiKey: required(env.GEMINI_API_KEY, "GEMINI_API_KEY"),
    geminiModel: env.GEMINI_MODEL || "gemini-2.0-flash",
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
