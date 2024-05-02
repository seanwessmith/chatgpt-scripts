import OpenAI from "openai";
import fs from "fs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

async function aiArtHistorian() {
  const imageSrc = __dirname + "/assets/image-one.png";
  const base64Image = fs.readFileSync(imageSrc, { encoding: "base64" });
  console.log("base64Image", base64Image.slice(0, 100));
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "You are an expert art historian. Your job is to interpret an image of a famous painting and describe it in detail. You should include the title of the painting, the artist, the year it was painted, and a detailed description of the painting. You should also include any historical context or interesting facts about the painting.",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
            },
          },
        ],
      },
    ],
  });

  return response.choices[0].message.content;
}

Bun.serve({
  port: 8080,
  hostname: "0.0.0.0",
  async fetch() {
    console.log("Running AI Art Historian...");
    const response = await aiArtHistorian();
    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json" },
    });
  },
});
