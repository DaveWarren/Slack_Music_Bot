import test from "node:test";
import assert from "node:assert/strict";
import { formatThemeMessage } from "../src/messageFormatter.js";

test("formats a generated theme for Slack", () => {
  assert.equal(
    formatThemeMessage("Share a song that feels like late summer rain."),
    ":musical_note: Today's music theme: Share a song that feels like late summer rain.\n\nDrop a Spotify link in the thread or channel."
  );
});
