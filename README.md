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

## AWS Lambda

If GitHub Actions is not available, run the same one-shot posting path in AWS Lambda and invoke it with EventBridge Scheduler.

Recommended AWS shape:

- **Lambda runtime:** Node.js 22.x
- **Handler:** `src/lambda.handler`
- **Trigger:** EventBridge Scheduler, for example `cron(0 9 * * ? *)`
- **Scheduler time zone:** `Europe/London` if you want the trigger to follow UK clock changes
- **State storage:** S3, using `STATE_FILE=s3://your-bucket/music-theme/last-post.json`
- **Timeout:** 30 seconds is plenty for the Slack API call

Create a deployment ZIP:

```sh
npm run lambda:zip
```

Set these Lambda environment variables:

```env
SLACK_BOT_TOKEN=xoxb-your-token
SLACK_CHANNEL_ID=C0123456789
STATE_FILE=s3://your-bucket/music-theme/last-post.json
TZ=Europe/London
```

The Lambda execution role needs permission to read and write that S3 object:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::your-bucket/music-theme/last-post.json"
    }
  ]
}
```

EventBridge should invoke the Lambda once per scheduled post. Do not run `npm start` in Lambda; that mode is a long-running local worker.

### Step-by-step deployment

1. Create an S3 bucket for state.

   The bot uses one small JSON file to remember recent prompts. Create a private bucket such as `my-music-theme-bot-state`, then choose a key such as:

   ```text
   music-theme/last-post.json
   ```

   You do not need to upload the file first. The Lambda will create it on the first successful run.

2. Create the Lambda execution role.

   In IAM, create a role trusted by Lambda. Attach the basic Lambda logging policy:

   ```text
   AWSLambdaBasicExecutionRole
   ```

   Add this inline policy, replacing the bucket name and key:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": ["s3:GetObject", "s3:PutObject"],
         "Resource": "arn:aws:s3:::my-music-theme-bot-state/music-theme/last-post.json"
       }
     ]
   }
   ```

3. Build the deployment ZIP.

   From this repo:

   ```sh
   npm run lambda:zip
   ```

   This creates `function.zip`.

4. Create the Lambda function.

   In AWS Lambda:

   - Choose **Create function**
   - Choose **Author from scratch**
   - Runtime: **Node.js 22.x**
   - Architecture: **arm64** is fine for this bot
   - Execution role: choose the role from step 2
   - Do not place the function in a VPC

5. Upload the ZIP.

   In the Lambda function code view, choose **Upload from** > **.zip file**, then upload `function.zip`.

6. Configure the Lambda handler.

   In **Runtime settings**, set:

   ```text
   src/lambda.handler
   ```

7. Set environment variables.

   In **Configuration** > **Environment variables**, add:

   ```env
   SLACK_BOT_TOKEN=xoxb-your-token
   SLACK_CHANNEL_ID=C0123456789
   STATE_FILE=s3://my-music-theme-bot-state/music-theme/last-post.json
   TZ=Europe/London
   ```

   Optional but useful:

   ```env
   NODE_OPTIONS=--enable-source-maps
   ```

8. Set runtime limits.

   In **Configuration** > **General configuration**:

   - Timeout: **30 seconds**
   - Memory: **128 MB** is enough

9. Test the Lambda manually.

   Create a Lambda test event:

   ```json
   {
     "slotKey": "manual-test"
   }
   ```

   Run it once. It should post a theme to Slack and create the S3 state file.

10. Create the schedule.

   In EventBridge Scheduler:

   - Choose **Create schedule**
   - Schedule type: **Recurring schedule**
   - Cron expression: `cron(0 9 * * ? *)`
   - Time zone: `Europe/London`
   - Flexible time window: **Off**
   - Target: your Lambda function

   The schedule input can be:

   ```json
   {}
   ```

   EventBridge includes a scheduled event time, and the Lambda uses that as duplicate protection.

11. Keep retries modest.

   In the schedule retry settings, a small retry count is fine. The Lambda skips duplicate scheduled events with the same event time, but if Slack is down, retries may post later once the original attempt succeeds.

12. Check logs after the first scheduled run.

   In CloudWatch Logs, look for:

   ```text
   Posted theme for ...
   ```

   If there is a failure, the most common causes are a missing Slack token, the bot not being invited to the Slack channel, or the Lambda role missing S3 permissions.

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

Slack lets you upload an app icon in **Basic Information** > **Display Information**. This repo includes a ready-to-upload 512x512 PNG at `assets/slack-app-icon.png`, plus the source SVG at `assets/slack-app-icon.svg`.
