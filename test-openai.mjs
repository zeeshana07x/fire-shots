import OpenAI from "openai";
import fs from "fs";

const env = fs.readFileSync(".env.local", "utf8");
const match = env.match(/OPENAI_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : "";

const openai = new OpenAI({ apiKey });

async function run() {
  console.log("Starting OpenAI API call...");
  try {
    const response = await openai.images.generate({
      model: "gpt-image-2",
      prompt: "A cute baby fox",
      n: 1,
      size: "1024x1792" // maybe gpt-image-2 does not like response_format, let's see default output
    });
    console.log("Response Keys:", Object.keys(response));
    console.log("Response Data Array length:", response.data?.length);
    if (response.data && response.data.length > 0) {
      console.log("First item keys:", Object.keys(response.data[0]));
      if (response.data[0].url) console.log("URL:", response.data[0].url);
      if (response.data[0].b64_json) console.log("Has b64_json (length):", response.data[0].b64_json.length);
    }
  } catch (err) {
    console.error("API Error:", err.message);
  }
}
run();
