export async function generateTheme({ apiKey, model, style }) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content:
            "You write fresh music-sharing prompts for a Slack channel. Return exactly one short sentence. Do not include quotation marks, numbering, markdown, or a Spotify URL."
        },
        {
          role: "user",
          content: `Generate one original theme asking people to share a Spotify link. Style: ${style}. Avoid generic prompts.`
        }
      ],
      max_output_tokens: 80
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload.error?.message || response.statusText;
    throw new Error(`OpenAI theme generation failed: ${message}`);
  }

  const text = extractOutputText(payload).trim();
  if (!text) {
    throw new Error("OpenAI returned an empty theme");
  }

  return normalizeTheme(text);
}

function extractOutputText(payload) {
  if (payload.output_text) {
    return payload.output_text;
  }

  const chunks = [];
  for (const item of payload.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) {
        chunks.push(content.text);
      }
    }
  }

  return chunks.join("\n");
}

function normalizeTheme(text) {
  return text
    .replace(/^["'\s]+|["'\s]+$/g, "")
    .replace(/^\d+[\).]\s*/, "")
    .replace(/\s+/g, " ");
}
