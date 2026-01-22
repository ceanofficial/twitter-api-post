import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { TwitterApi } from "twitter-api-v2";

dotenv.config();

// ===============================
// Validate Environment Variables
// ===============================
const requiredEnvVars = [
  "X_API_KEY",
  "X_API_SECRET",
  "X_ACCESS_TOKEN",
  "X_ACCESS_SECRET"
];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    console.error(`❌ Missing environment variable: ${key}`);
    process.exit(1);
  }
}

// ===============================
// Initialize Twitter Client
// ===============================
const client = new TwitterApi({
  appKey: process.env.X_API_KEY,
  appSecret: process.env.X_API_SECRET,
  accessToken: process.env.X_ACCESS_TOKEN,
  accessSecret: process.env.X_ACCESS_SECRET
});

// ===============================
// Load Posts from JSON
// ===============================
const POSTS_FILE = path.resolve("./posts.json");

if (!fs.existsSync(POSTS_FILE)) {
  console.error("❌ posts.json not found");
  process.exit(1);
}

let posts;

try {
  posts = JSON.parse(fs.readFileSync(POSTS_FILE, "utf-8"));
} catch (err) {
  console.error("❌ Failed to parse posts.json");
  process.exit(1);
}

if (!Array.isArray(posts)) {
  console.error("❌ posts.json must contain an array");
  process.exit(1);
}

// ===============================
// Post Tweets Sequentially
// ===============================
const postTweets = async () => {
  for (const post of posts) {
    if (!post.text || typeof post.text !== "string") {
      console.warn("⚠️ Skipping invalid post:", post);
      continue;
    }

    try {
      const response = await client.v2.tweet(post.text);
      console.log(`✅ Posted: "${post.text}"`);
      console.log(`🆔 Tweet ID: ${response.data.id}`);
    } catch (err) {
      console.error("❌ Failed to post tweet:", post.text);
      console.error(err);
    }

    // Optional delay (in ms) to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
};

postTweets();
