# Slack Music Theme Bot

A small Slack worker that posts a generated music-sharing theme on a configurable cadence.

Example post:

> Today's music theme: Share a Spotify link to a song that sounds like the first warm evening of summer.

Themes are generated at posting time with the OpenAI API, so the bot is not cycling through a hardcoded prompt list.

## Setup

1. Create a Slack app, using `slack-app-manifest.json` if you want the quickest path.
2. Invite the bot to the channel where people will share Spotify links.
3. Copy `.env.example` to `.env` and fill in:
   - `SLACK_BOT_TOKEN`
   - `SLACK_CHANNEL_ID`
   - `OPENAI_API_KEY`
4. Run with Node 20 or newer:

```sh
npm start
```

Post a single theme immediately:

```sh
npm run post-now
```

## Configuration

`SCHEDULE_CADENCE` supports:

- `hourly`: posts at the top of every hour.
- `daily`: posts every day at `SCHEDULE_TIME`.
- `weekly`: posts on `SCHEDULE_DAY` at `SCHEDULE_TIME`.
- `interval`: posts every `SCHEDULE_INTERVAL_MINUTES`.

The schedule uses the `TZ` environment variable. Set it to an IANA time zone such as `Europe/London` or `America/New_York`.

## Running in production

Run this as a long-lived worker process with your process manager of choice, such as systemd, Docker, Render worker, Fly machine, or Heroku worker dyno. The `.state/last-post.json` file prevents duplicate posts for the same scheduled slot after restarts.

## Slack scopes

Minimum bot token scope:

- `chat:write`

No event subscription is required unless you later want the bot to react to posted Spotify links.
