import { createHmac, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { generateTheme } from "./themeGenerator.js";
import { formatThemeMessage } from "./messageFormatter.js";
import { postResponseUrl } from "./responseUrlClient.js";

const maxBodyBytes = 1024 * 1024;

export function startSlashCommandServer(config) {
  if (!config.slackSigningSecret) {
    throw new Error("SLACK_SIGNING_SECRET is required for slash command server mode");
  }

  const server = createServer(async (request, response) => {
    if (request.method !== "POST" || request.url !== config.slashCommandPath) {
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

    postSlashTheme(config, responseUrl).catch((error) => {
      console.error(error);
    });
  });

  server.listen(config.port, () => {
    console.log(
      `Slash command server listening on port ${config.port} at ${config.slashCommandPath}`
    );
  });

  return server;
}

async function postSlashTheme(config, responseUrl) {
  const theme = await generateTheme({
    apiKey: config.geminiApiKey,
    model: config.geminiModel,
    style: config.promptStyle
  });

  await postResponseUrl({
    responseUrl,
    text: formatThemeMessage(theme)
  });

  console.log(`Posted slash-command theme: ${theme}`);
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
