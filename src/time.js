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

export function zonedDateKey(date, timeZone) {
  const parts = zonedParts(date, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function zonedDateTimeKey(date, timeZone) {
  const parts = zonedParts(date, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function minuteOfDay(date, timeZone) {
  const parts = zonedParts(date, timeZone);
  return Number(parts.hour) * 60 + Number(parts.minute);
}

export function weekdayIndex(date, timeZone) {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long"
  })
    .format(date)
    .toLowerCase();

  return weekdayNames.indexOf(weekday);
}

export const weekdayNames = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday"
];
