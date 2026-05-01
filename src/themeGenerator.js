const maxAttempts = 3;

export async function generateTheme({ endpoint, apiKey, model, apiVersion, style }) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const theme = await generateThemeAttempt({
        endpoint,
        apiKey,
        model,
        apiVersion,
        style,
        attempt
      });
      if (isUsableTheme(theme)) {
        return theme;
      }

      lastError = new Error(`Azure AI returned an incomplete theme: ${theme}`);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Azure AI could not generate a usable theme");
}

async function generateThemeAttempt({ endpoint, apiKey, model, apiVersion, style, attempt }) {
  const response = await fetch(buildChatCompletionsUrl(endpoint, apiVersion), {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: [
            "You write fresh music-sharing themes for a Slack channel.",
            "Return valid JSON only, with one property named theme.",
            "The theme must be one complete sentence.",
            "The sentence must start with Share.",
            "Do not include markdown, numbering, quotation marks, or a Spotify URL."
          ].join(" ")
        },
        {
          role: "user",
          content: [
            "Generate one original theme asking people to share a Spotify link.",
            `Style: ${style}.`,
            "Make it specific, easy to answer, and no more than 24 words.",
            "Avoid generic openers like 'What's the'.",
            `Attempt: ${attempt}.`
          ].join(" ")
        }
      ],
      max_tokens: 120,
      temperature: 1,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "music_theme",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              theme: { type: "string" }
            },
            required: ["theme"]
          }
        }
      }
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload.error?.message || response.statusText;
    throw new Error(`Azure AI theme generation failed: ${message}`);
  }

  const text = extractOutputText(payload).trim();
  if (!text) {
    throw new Error("Azure AI returned an empty theme");
  }

  return normalizeTheme(extractTheme(text));
}

function extractOutputText(payload) {
  return payload.choices?.[0]?.message?.content || "";
}

function extractTheme(text) {
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed.theme === "string") {
      return parsed.theme;
    }
  } catch {
    return text;
  }

  return text;
}

function normalizeTheme(text) {
  return text
    .replace(/```(?:json)?/gi, "")
    .replace(/^["'\s]+|["'\s]+$/g, "")
    .replace(/^\d+[\).]\s*/, "")
    .replace(/\s+/g, " ");
}

export function isUsableTheme(theme) {
  const words = theme.split(/\s+/).filter(Boolean);
  if (words.length < 7 || words.length > 30) {
    return false;
  }

  if (!/^share\b/i.test(theme)) {
    return false;
  }

  if (/\b(the|a|an|of|for|to|with|that|when|where|what'?s)$/i.test(theme)) {
    return false;
  }

  return /[.!?]$/.test(theme);
}

function buildChatCompletionsUrl(endpoint, apiVersion) {
  const trimmedEndpoint = endpoint.replace(/\/+$/, "");
  return `${trimmedEndpoint}/models/chat/completions?api-version=${encodeURIComponent(
    apiVersion
  )}`;
}
