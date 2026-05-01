import test from "node:test";
import assert from "node:assert/strict";
import { dueSlot, nextCheckDelayMs } from "../src/scheduler.js";

test("daily schedule is not due before the configured local minute", () => {
  const slot = dueSlot(new Date("2026-05-01T07:59:00Z"), {
    cadence: "daily",
    time: "09:00",
    timeZone: "Europe/London"
  });

  assert.equal(slot, null);
});

test("daily schedule is not due after the configured local minute", () => {
  const slot = dueSlot(new Date("2026-05-01T08:01:00Z"), {
    cadence: "daily",
    time: "09:00",
    timeZone: "Europe/London"
  });

  assert.equal(slot, null);
});

test("daily schedule becomes due at configured local time", () => {
  const slot = dueSlot(new Date("2026-05-01T08:00:00Z"), {
    cadence: "daily",
    time: "09:00",
    timeZone: "Europe/London"
  });

  assert.equal(slot.key, "daily:2026-05-01:09:00");
});

test("weekly schedule only becomes due on configured day", () => {
  const schedule = {
    cadence: "weekly",
    day: "monday",
    time: "09:00",
    timeZone: "Europe/London"
  };

  assert.equal(dueSlot(new Date("2026-05-01T08:00:00Z"), schedule), null);
  assert.equal(
    dueSlot(new Date("2026-05-04T08:00:00Z"), schedule).key,
    "weekly:monday:2026-05-04:09:00"
  );
});

test("hourly schedule is not due between hour boundaries", () => {
  const slot = dueSlot(new Date("2026-05-01T08:42:00Z"), {
    cadence: "hourly",
    timeZone: "Europe/London"
  });

  assert.equal(slot, null);
});

test("hourly schedule keys the current hour at the hour boundary", () => {
  const slot = dueSlot(new Date("2026-05-01T08:00:00Z"), {
    cadence: "hourly",
    timeZone: "Europe/London"
  });

  assert.equal(slot.key, "hourly:2026-05-01T09:00");
});

test("interval schedule is not due between interval boundaries", () => {
  const slot = dueSlot(new Date("2026-05-01T08:42:00Z"), {
    cadence: "interval",
    intervalMinutes: 30,
    timeZone: "UTC"
  });

  assert.equal(slot, null);
});

test("interval schedule floors to interval boundary when due", () => {
  const slot = dueSlot(new Date("2026-05-01T08:30:00Z"), {
    cadence: "interval",
    intervalMinutes: 30,
    timeZone: "UTC"
  });

  assert.equal(slot.key, "interval:30:2026-05-01T08:30:00.000Z");
});

test("next hourly check is the next hour boundary", () => {
  const delay = nextCheckDelayMs(new Date("2026-05-01T08:42:00Z"), {
    cadence: "hourly",
    timeZone: "UTC"
  });

  assert.equal(delay, 18 * 60 * 1000);
});
