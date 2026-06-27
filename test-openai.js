import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function run() {
  try {
    const response = await openai.images.generate({
      model: "gpt-image-2",
      prompt: "A cute baby fox",
      n: 1,
      size: "1024x1792"
    });
    console.log(JSON.stringify(response.data, null, 2));
  } catch (err) {
    console.error(err.message);
  }
}
run();
