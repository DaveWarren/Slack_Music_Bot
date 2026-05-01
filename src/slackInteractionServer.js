import { createHmac, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { generateThemeChoice } from "./themeGenerator.js";
import { formatThemeMessage } from "./messageFormatter.js";
import { postResponseUrl } from "./responseUrlClient.js";
import { postMessage } from "./slackClient.js";
import { readLastPost, writeLastPost } from "./stateStore.js";

const maxBodyBytes = 1024 * 1024;
const historyLimit = 90;

export function startSlackInteractionServer(config) {
  if (!config.slackSigningSecret) {
    throw new Error("SLACK_SIGNING_SECRET is required for server mode");
  }

  const server = createServer(async (request, response) => {
    if (request.method !== "POST") {
      sendJson(response, 404, { text: "Not found" });
      return;
    }

    let rawBody;
    try {
      rawBody = await readRequestBody(request);
    } catch (error) {
      sendJson(response, 413, { text: error.message });
      return;
    }

    if (!verifySlackRequest(request.headers, rawBody, config.slackSigningSecret)) {
      sendJson(response, 401, { text: "Invalid Slack signature" });
      return;
    }

    if (request.url === config.slashCommandPath) {
      await handleSlashCommand(config, rawBody, response);
      return;
    }

    if (request.url === config.slackEventsPath) {
      await handleSlackEvent(config, rawBody, response);
      return;
    }

    sendJson(response, 404, { text: "Not found" });
  });

  server.listen(config.port, () => {
    console.log(
      `Slack interaction server listening on port ${config.port} for ${config.slashCommandPath} and ${config.slackEventsPath}`
    );
  });

  return server;
}

export function shouldPickThemeFromMention(text = "") {
  const normalized = text
    .replace(/<@[A-Z0-9]+>/g, "")
    .replace(/[^\w\s]/g, " ")
    .toLowerCase();

  return /\b(pick|choose|post|share|give|send)\b/.test(normalized) &&
    /\b(theme|prompt|music|song)\b/.test(normalized);
}

async function handleSlashCommand(config, rawBody, response) {
  const form = new URLSearchParams(rawBody.toString("utf8"));
  const responseUrl = form.get("response_url");
  if (!responseUrl) {
    sendJson(response, 400, { text: "Missing response_url" });
    return;
  }

  sendJson(response, 200, {
    response_type: "ephemeral",
    text: "Picking a fresh music theme..."
  });

  postThemeToResponseUrl(config, responseUrl).catch((error) => {
    console.error(error);
  });
}

async function handleSlackEvent(config, rawBody, response) {
  const payload = JSON.parse(rawBody.toString("utf8"));
  if (payload.type === "url_verification") {
    sendJson(response, 200, { challenge: payload.challenge });
    return;
  }

  sendJson(response, 200, { ok: true });

  const event = payload.event;
  if (
    payload.type !== "event_callback" ||
    event?.type !== "app_mention" ||
    event.bot_id ||
    !event.channel ||
    !shouldPickThemeFromMention(event.text)
  ) {
    return;
  }

  postThemeToChannel(config, event.channel).catch((error) => {
    console.error(error);
  });
}

async function postThemeToResponseUrl(config, responseUrl) {
  const choice = await pickThemeWithHistory(config);

  await postResponseUrl({
    responseUrl,
    text: formatThemeMessage(choice.theme)
  });

  await saveThemeHistory(config, choice, null);
  console.log(`Posted slash-command theme (${choice.category}): ${choice.theme}`);
}

async function postThemeToChannel(config, channel) {
  const choice = await pickThemeWithHistory(config);
  const slackResponse = await postMessage({
    token: config.slackBotToken,
    channel,
    text: formatThemeMessage(choice.theme)
  });

  await saveThemeHistory(config, choice, slackResponse.ts);
  console.log(`Posted mention theme to ${channel} (${choice.category}): ${choice.theme}`);
}

async function pickThemeWithHistory(config) {
  const state = await readLastPost(config.stateFile);
  const history = extractHistory(state);

  return generateThemeChoice({
    now: new Date(),
    previousThemes: history.map((entry) => entry.theme),
    previousCategories: history.map((entry) => entry.category).filter(Boolean)
  });
}

async function saveThemeHistory(config, choice, slackTs) {
  const state = await readLastPost(config.stateFile);
  const history = extractHistory(state);
  const postedAt = new Date().toISOString();

  await writeLastPost(config.stateFile, {
    ...state,
    theme: choice.theme,
    category: choice.category,
    slackTs,
    postedAt,
    history: [
      {
        theme: choice.theme,
        category: choice.category,
        postedAt
      },
      ...history
    ].slice(0, historyLimit)
  });
}

function extractHistory(state) {
  return (
    state?.history ||
    (state?.theme
      ? [
          {
            theme: state.theme,
            category: state.category,
            postedAt: state.postedAt
          }
        ]
      : [])
  );
}

function verifySlackRequest(headers, rawBody, signingSecret) {
  const timestamp = headers["x-slack-request-timestamp"];
  const signature = headers["x-slack-signature"];
  if (!timestamp || !signature) {
    return false;
  }

  const requestAgeSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(requestAgeSeconds) || requestAgeSeconds > 60 * 5) {
    return false;
  }

  const baseString = `v0:${timestamp}:${rawBody.toString("utf8")}`;
  const digest = createHmac("sha256", signingSecret).update(baseString).digest("hex");
  const expected = Buffer.from(`v0=${digest}`, "utf8");
  const actual = Buffer.from(signature, "utf8");

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

async function readRequestBody(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBodyBytes) {
      throw new Error("Request body too large");
    }

    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json"
  });
  response.end(JSON.stringify(payload));
}
