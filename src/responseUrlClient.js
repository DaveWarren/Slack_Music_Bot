export async function postResponseUrl({ responseUrl, text }) {
  const response = await fetch(responseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      response_type: "in_channel",
      text,
      unfurl_links: true,
      unfurl_media: true
    })
  });

  if (!response.ok) {
    throw new Error(`Slack response_url post failed: ${response.statusText}`);
  }
}
