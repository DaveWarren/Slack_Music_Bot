import { generateSampleThemes } from "./themeGenerator.js";

const count = Number.parseInt(process.argv[2] || "100", 10);
if (!Number.isInteger(count) || count < 1) {
  throw new Error("Sample count must be a positive integer");
}

const date = process.argv[3] ? new Date(process.argv[3]) : new Date();
if (Number.isNaN(date.getTime())) {
  throw new Error("Optional date must be parseable by JavaScript Date");
}

const themes = generateSampleThemes({ count, now: date });
themes.forEach((theme, index) => {
  console.log(`${String(index + 1).padStart(3, " ")}. ${theme}`);
});
