import { generateSampleThemes } from "./themeGenerator.js";

// Optional first arg controls how many sample prompts to print.
const count = Number.parseInt(process.argv[2] || "100", 10);
if (!Number.isInteger(count) || count < 1) {
  throw new Error("Sample count must be a positive integer");
}

// Optional second arg fixes the date, which is useful for checking Friday-only prompts.
const date = process.argv[3] ? new Date(process.argv[3]) : new Date();
if (Number.isNaN(date.getTime())) {
  throw new Error("Optional date must be parseable by JavaScript Date");
}

// Print numbered prompts so the generated mix is easy to scan in the terminal.
const themes = generateSampleThemes({ count, now: date });
themes.forEach((theme, index) => {
  console.log(`${String(index + 1).padStart(3, " ")}. ${theme}`);
});
