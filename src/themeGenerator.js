const maxAttempts = 3;

export async function generateTheme({ apiKey, model, style }) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const theme = await generateThemeAttempt({ apiKey, model, style, attempt });
      if (isUsableTheme(theme)) {
        return theme;
      }

      lastError = new Error(`Gemini returned an incomplete theme: ${theme}`);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Gemini could not generate a usable theme");
}

async function generateThemeAttempt({ apiKey, model, style, attempt }) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: [
                "You write fresh music-sharing themes for a Slack channel.",
                "Return valid JSON only, with one property named theme.",
                "The theme must be one complete sentence.",
                "The sentence must start with Share.",
                "Do not include markdown, numbering, quotation marks, or a Spotify URL."
              ].join(" ")
            }
          ]
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: [
                  `Generate one original theme asking people to share a Spotify link.`,
                  `Style: ${style}.`,
                  "Make it specific, easy to answer, and no more than 24 words.",
                  "Avoid generic openers like 'What's the'.",
                  `Attempt: ${attempt}.`
                ].join(" ")
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 160,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              theme: {
                type: "STRING"
              }
            },
            required: ["theme"],
            propertyOrdering: ["theme"]
          },
          thinkingConfig: {
            thinkingBudget: 0
          },
          temperature: 1
        }
      })
    }
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload.error?.message || response.statusText;
    throw new Error(`Gemini theme generation failed: ${message}`);
  }

  const text = extractOutputText(payload).trim();
  if (!text) {
    throw new Error("Gemini returned an empty theme");
  }

  return normalizeTheme(extractTheme(text));
}

function extractOutputText(payload) {
  return (payload.candidates || [])
    .flatMap((candidate) => candidate.content?.parts || [])
    .map((part) => part.text || "")
    .join("\n");
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
