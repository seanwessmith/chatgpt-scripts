import OpenAI from "openai";
import fs from "fs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const main = async () => {
  try {
    const assistant = await openai.beta.assistants.create({
      name: "Book Analyzer",
      instructions:
        "You are an expert knowledge synthesizer. Use you knowledge base to create Chapter Recaps and Reflections, Create a timeline or a conceptual map that tracks the key developments, Formulate questions or discussion points for each chapter, Comparative Analysis and Application of Concepts.",
      model: "gpt-4-turbo",
      tools: [{ type: "file_search" }],
    });

    console.log("Assistant created");

    // Create a vector store including our two files.
    let vectorStore = await openai.beta.vectorStores.create({
      name: "Read Write Own",
    });

    console.log("Vector Store created");

    const fileOne = await openai.files.create({
      file: fs.createReadStream("./read-write-own.txt"),
      purpose: "assistants",
    });

    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: "user",
          content: "output Chapter Recaps and Reflections results",
          // Attach the new file to the message.
          attachments: [
            { file_id: fileOne.id, tools: [{ type: "file_search" }] },
          ],
        },
      ],
    });

    await openai.beta.assistants.update(assistant.id, {
      tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
    });

    console.log("Assistant updated");
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistant.id,
    });

    const messages = await openai.beta.threads.messages.list(thread.id, {
      run_id: run.id,
    });

    console.log("Messages retrieved");

    const message = messages.data.pop()!;
    if (message.content[0].type === "text") {
      const { text } = message.content[0];
      const { annotations } = text;
      const citations: string[] = [];

      let index = 0;
      for (let annotation of annotations) {
        text.value = text.value.replace(annotation.text, "[" + index + "]");
        console.log(annotation);
        const { file_citation } = annotation as any;
        if (file_citation) {
          const citedFile = await openai.files.retrieve(file_citation.file_id);
          citations.push("[" + index + "]" + citedFile.filename);
        }
        index++;
      }

      console.log(text.value);
      console.log(citations.join("\n"));
    }
  } catch (err) {
    console.error(err);
  }
};

main();
