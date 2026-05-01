import {
  minuteOfDay,
  weekdayIndex,
  weekdayNames,
  zonedDateKey,
  zonedDateTimeKey
} from "./time.js";

const minuteMs = 60 * 1000;
const hourMs = 60 * minuteMs;

export function dueSlot(now, schedule) {
  validateSchedule(schedule);

  if (schedule.cadence === "interval") {
    const intervalMs = schedule.intervalMinutes * minuteMs;
    if (now.getTime() % intervalMs >= minuteMs) {
      return null;
    }

    const slotStart = Math.floor(now.getTime() / intervalMs) * intervalMs;
    return {
      key: `interval:${schedule.intervalMinutes}:${new Date(slotStart).toISOString()}`,
      dueAt: new Date(slotStart)
    };
  }

  if (schedule.cadence === "hourly") {
    if (minuteOfDay(now, schedule.timeZone) % 60 !== 0) {
      return null;
    }

    const slotStart = new Date(now);
    slotStart.setUTCMinutes(0, 0, 0);
    return {
      key: `hourly:${zonedDateTimeKey(slotStart, schedule.timeZone)}`,
      dueAt: slotStart
    };
  }

  const targetMinute = parseTime(schedule.time);
  const currentMinute = minuteOfDay(now, schedule.timeZone);
  if (currentMinute !== targetMinute) {
    return null;
  }

  if (schedule.cadence === "daily") {
    return {
      key: `daily:${zonedDateKey(now, schedule.timeZone)}:${schedule.time}`,
      dueAt: now
    };
  }

  const targetDay = weekdayNames.indexOf(schedule.day);
  if (weekdayIndex(now, schedule.timeZone) !== targetDay) {
    return null;
  }

  return {
    key: `weekly:${schedule.day}:${zonedDateKey(now, schedule.timeZone)}:${schedule.time}`,
    dueAt: now
  };
}

export function nextCheckDelayMs(now, schedule) {
  if (schedule.cadence === "interval") {
    const intervalMs = schedule.intervalMinutes * minuteMs;
    const nextSlot = Math.floor(now.getTime() / intervalMs) * intervalMs + intervalMs;
    return Math.max(1000, nextSlot - now.getTime());
  }

  if (schedule.cadence === "hourly") {
    const nextHour = new Date(now);
    nextHour.setUTCHours(nextHour.getUTCHours() + 1, 0, 0, 0);
    return Math.max(1000, nextHour.getTime() - now.getTime());
  }

  return 30 * 1000;
}

export function validateSchedule(schedule) {
  if (!schedule.timeZone) {
    throw new Error("A schedule timeZone is required");
  }

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: schedule.timeZone });
  } catch {
    throw new Error(`Invalid time zone: ${schedule.timeZone}`);
  }

  if (schedule.cadence === "daily" || schedule.cadence === "weekly") {
    parseTime(schedule.time);
  }

  if (schedule.cadence === "weekly" && !weekdayNames.includes(schedule.day)) {
    throw new Error(`SCHEDULE_DAY must be one of: ${weekdayNames.join(", ")}`);
  }

  if (
    schedule.cadence === "interval" &&
    (!Number.isInteger(schedule.intervalMinutes) || schedule.intervalMinutes < 1)
  ) {
    throw new Error("SCHEDULE_INTERVAL_MINUTES must be a positive integer");
  }
}

function parseTime(value) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value || "");
  if (!match) {
    throw new Error("SCHEDULE_TIME must be in 24-hour HH:MM format");
  }

  return Number(match[1]) * 60 + Number(match[2]);
}
