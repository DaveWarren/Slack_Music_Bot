// Return the calendar/time pieces for a Date as they appear in a target time zone.
export function zonedParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

// Stable date key used for daily/weekly schedule slots.
export function zonedDateKey(date, timeZone) {
  const parts = zonedParts(date, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

// Stable minute-level key used for hourly schedule slots.
export function zonedDateTimeKey(date, timeZone) {
  const parts = zonedParts(date, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

// Convert the local zoned time into minutes since midnight.
export function minuteOfDay(date, timeZone) {
  const parts = zonedParts(date, timeZone);
  return Number(parts.hour) * 60 + Number(parts.minute);
}

// Return 0-6 using the same order as `weekdayNames`.
export function weekdayIndex(date, timeZone) {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long"
  })
    .format(date)
    .toLowerCase();

  return weekdayNames.indexOf(weekday);
}

// Shared weekday spelling for config validation and comparisons.
export const weekdayNames = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday"
];
