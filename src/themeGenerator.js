export async function generateTheme({ apiKey, model, style }) {
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
              text: "You write fresh music-sharing prompts for a Slack channel. Return exactly one short sentence. Do not include quotation marks, numbering, markdown, or a Spotify URL."
            }
          ]
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Generate one original theme asking people to share a Spotify link. Style: ${style}. Avoid generic prompts.`
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 80,
          temperature: 0.9
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

  return normalizeTheme(text);
}

function extractOutputText(payload) {
  return (payload.candidates || [])
    .flatMap((candidate) => candidate.content?.parts || [])
    .map((part) => part.text || "")
    .join("\n");
}

function normalizeTheme(text) {
  return text
    .replace(/^["'\s]+|["'\s]+$/g, "")
    .replace(/^\d+[\).]\s*/, "")
    .replace(/\s+/g, " ");
}
