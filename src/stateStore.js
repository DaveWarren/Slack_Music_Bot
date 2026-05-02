import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

// Load the last post state, returning null when the bot has never posted before.
export async function readLastPost(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

// Persist the latest post and recent prompt history as formatted JSON.
export async function writeLastPost(path, state) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}
