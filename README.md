# Slack Music Theme Bot

A small Slack bot that posts a music-sharing theme into a channel. It is designed for the simple production path: **GitHub Actions runs on a schedule, generates a local prompt, posts to Slack, then exits**.

Example post:

> Today's music theme: Share a song with a perfect first 10 seconds.

Themes are generated locally from weighted prompt categories. The bot does not call any AI API.

## Corp Slack Setup

1. Create a Slack app at https://api.slack.com/apps.
2. Choose **Create New App** > **From an app manifest**.
3. Select your corp workspace.
4. Paste `slack-app-manifest.json`.
5. Install the app to the workspace.
6. Copy the **Bot User OAuth Token** from **OAuth & Permissions**. It starts with `xoxb-`.
7. Invite the bot to the target Slack channel:

```text
/invite @Music Theme Bot
```

The app only needs the `chat:write` bot scope. If your corp Slack requires app approval, this minimal manifest should be easier to approve than an interactive app with events or slash commands.

## GitHub Actions Only

This is the recommended way to run the bot. No server, public URL, Slack event subscription, slash command, or Slack reminder is required.

1. Push this repo to GitHub.
2. Go to **Settings** > **Secrets and variables** > **Actions**.
3. Add these repository secrets:

```text
SLACK_BOT_TOKEN
SLACK_CHANNEL_ID
```

4. Go to **Actions** > **Post music theme** > **Run workflow** to test it manually.

The workflow lives at `.github/workflows/post-music-theme.yml`. It runs `npm run post-now`, caches `.state`, and preserves recent prompt history between runs.

The default schedule is:

```yaml
- cron: "0 9 * * *"
```

That is 09:00 UTC. For 09:00 London time during British Summer Time, change it to:

```yaml
- cron: "0 8 * * *"
```

## Local Commands

Post one theme immediately:

```sh
npm run post-now
```

Print 100 sample prompts without posting to Slack:

```sh
npm run sample-prompts
```

Run tests:

```sh
npm test
```

## Configuration

For local runs, copy `.env.example` to `.env` and fill in:

```env
SLACK_BOT_TOKEN=xoxb-your-token
SLACK_CHANNEL_ID=C0123456789
```

Optional schedule settings are still supported for local `npm start` worker mode:

- `SCHEDULE_CADENCE`: `hourly`, `daily`, `weekly`, or `interval`
- `SCHEDULE_TIME`: 24-hour `HH:MM`
- `SCHEDULE_DAY`: used for weekly schedules
- `SCHEDULE_INTERVAL_MINUTES`: used for interval schedules
- `TZ`: IANA time zone such as `Europe/London`

## Prompt Selection

Prompt selection is category-first and weighted so large prompt families, such as years and letters, do not dominate the schedule. The bot stores recent prompt history in `.state/last-post.json` and avoids recent exact repeats and the last couple of categories where possible.

Weekend/Friday prompts are only eligible on Fridays.

## App Icon

Slack lets you upload an app icon in **Basic Information** > **Display Information**. This repo includes `assets/slack-app-icon.svg`; if Slack asks for a PNG, export it from the SVG and upload the PNG.
