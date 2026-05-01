export async function postMessage({ token, channel, text }) {
  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({
      channel,
      text,
      unfurl_links: true,
      unfurl_media: true
    })
  });

  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(`Slack post failed: ${payload.error || response.statusText}`);
  }

  return payload;
}
