import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

function isValidBase64String(base64String: string): boolean {
  const regex = /^data:image\/[a-z]+;base64,/;
  return regex.test(base64String);
}

async function aiArtHistorian(req: Request): Promise<Response> {
  let json: any;
  try {
    json = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
    });
  }

  const base64Image = json.image as string;
  if (!base64Image) {
    return new Response(JSON.stringify({ error: "No image found in body" }), {
      status: 400,
    });
  }

  if (!isValidBase64String(base64Image)) {
    return new Response(JSON.stringify({ error: "Invalid base64 string" }), {
      status: 400,
    });
  }

  // check if the image is too large
  var stringLength = base64Image.length - "data:image/jpeg;base64,".length;
  var sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896334383812;
  var sizeInKb = sizeInBytes / 1000;
  console.log("sizeInKb", sizeInKb);
  if (sizeInKb > 20000) {
    return new Response(
      JSON.stringify({ error: "Image is too large. Max size is 20 MB" }),
      { status: 400 }
    );
  }

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
              url: base64Image,
            },
          },
        ],
      },
    ],
  });

  return new Response(JSON.stringify(response.choices[0].message.content), {
    headers: { "Content-Type": "application/json" },
  });
}

// Assuming Bun is your HTTP server
Bun.serve({
  port: 8080,
  hostname: "0.0.0.0",
  async fetch(req) {
    console.log("Running AI Art Historian...");
    return await aiArtHistorian(req);
  },
});
