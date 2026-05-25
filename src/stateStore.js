import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

// Load the last post state, returning null when the bot has never posted before.
export async function readLastPost(path) {
  if (isS3Uri(path)) {
    return readS3Json(path);
  }

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
  if (isS3Uri(path)) {
    await writeS3Json(path, state);
    return;
  }

  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function isS3Uri(path) {
  return path?.startsWith("s3://");
}

function parseS3Uri(uri) {
  const parsed = new URL(uri);
  const bucket = parsed.hostname;
  const key = parsed.pathname.replace(/^\/+/, "");

  if (!bucket || !key) {
    throw new Error("S3 state path must look like s3://bucket/key.json");
  }

  return { bucket, key };
}

async function readS3Json(uri) {
  const { GetObjectCommand, S3Client } = await import("@aws-sdk/client-s3");
  const { bucket, key } = parseS3Uri(uri);
  const client = new S3Client({});

  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key
      })
    );

    return JSON.parse(await response.Body.transformToString());
  } catch (error) {
    if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
      return null;
    }

    throw error;
  }
}

async function writeS3Json(uri, state) {
  const { PutObjectCommand, S3Client } = await import("@aws-sdk/client-s3");
  const { bucket, key } = parseS3Uri(uri);
  const client = new S3Client({});

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: `${JSON.stringify(state, null, 2)}\n`,
      ContentType: "application/json"
    })
  );
}
