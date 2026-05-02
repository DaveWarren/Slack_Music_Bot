// Supported schedule modes for automated posting.
const validCadences = new Set(["hourly", "daily", "weekly", "interval"]);

// Read all runtime settings from environment variables and apply safe defaults.
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
    slackSigningSecret: env.SLACK_SIGNING_SECRET,
    slashCommandPath: env.SLASH_COMMAND_PATH || "/slack/commands",
    slackEventsPath: env.SLACK_EVENTS_PATH || "/slack/events",
    port: Number.parseInt(env.PORT || "3000", 10),
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

// Make missing required env vars fail early with a clear message.
function required(value, name) {
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}
