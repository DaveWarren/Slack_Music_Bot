# Slack Music Theme Bot

A small Slack worker that posts a generated music-sharing theme on a configurable cadence.

Example post:

> Today's music theme: Share a Spotify link to a song that sounds like the first warm evening of summer.

Themes are generated locally by combining a large set of built-in music prompts with reusable variations. The bot does not call any AI API.

## Setup

1. Create a Slack app, using `slack-app-manifest.json` if you want the quickest path.
2. Invite the bot to the channel where people will share Spotify links.
3. Copy `.env.example` to `.env` and fill in:
   - `SLACK_BOT_TOKEN`
   - `SLACK_CHANNEL_ID`
4. Run with Node 20 or newer:

```sh
npm start
```

Post a single theme immediately:

```sh
npm run post-now
```

Print 100 sample prompts without posting to Slack:

```sh
npm run sample-prompts
```

Run the Slack interaction server:

```sh
npm run server
```

It supports both:

- `/music-theme`
- `@Music Theme Bot pick a theme`

Configure a Slack slash command named `/music-theme` with request URL:

```text
https://your-public-host/slack/commands
```

Configure Slack Events API with request URL:

```text
https://your-public-host/slack/events
```

Subscribe the bot to the `app_mention` event. Then a Slack reminder can trigger it:

```text
/remind #music "@Music Theme Bot pick a theme" every Friday at 9am
```

For local testing, expose port `3000` with a tunnel such as ngrok and use the tunnel URL. Add Slack's signing secret to `.env` as `SLACK_SIGNING_SECRET`.

## Configuration

`SCHEDULE_CADENCE` supports:

- `hourly`: posts at the top of every hour.
- `daily`: posts every day at `SCHEDULE_TIME`.
- `weekly`: posts on `SCHEDULE_DAY` at `SCHEDULE_TIME`.
- `interval`: posts every `SCHEDULE_INTERVAL_MINUTES`.

The schedule uses the `TZ` environment variable. Set it to an IANA time zone such as `Europe/London` or `America/New_York`.

Weekend prompts are only eligible on Fridays. Prompt selection is category-first and weighted, so large families like years and letters do not dominate the schedule. The bot also stores recent prompt history in `.state/last-post.json` and avoids recent exact repeats and the last couple of categories where possible.

## Running in production

Run this as a long-lived worker process with your process manager of choice, such as systemd, Docker, Render worker, Fly machine, or Heroku worker dyno. The `.state/last-post.json` file prevents duplicate posts for the same scheduled slot after restarts.

## GitHub Actions

This repo includes `.github/workflows/post-music-theme.yml`, which posts a theme on a GitHub Actions schedule and can also be run manually from the GitHub Actions tab.

Add these repository secrets in GitHub:

- `SLACK_BOT_TOKEN`
- `SLACK_CHANNEL_ID`

The workflow runs `npm run post-now`, so GitHub handles the scheduling and no always-on server is needed. The `.state` folder is cached between runs so recent prompt history is preserved.

The default cron is `0 9 * * *`, which is 09:00 UTC. For 09:00 London time during British Summer Time, change it to `0 8 * * *`.

## Slack scopes

Minimum bot token scope:

- `chat:write`
- `app_mentions:read`

Enable Event Subscriptions and subscribe to the `app_mention` bot event if you want Slack reminders or channel members to trigger themes by mentioning the bot.

Server mode uses Slack's request signing secret. Find it in your Slack app under **Basic Information** > **App Credentials** > **Signing Secret**.
