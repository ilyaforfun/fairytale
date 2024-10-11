const OpenAI = require("openai");
const fs = require("fs").promises;
const path = require("path");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateSpeech(text, outputFileName) {
  try {
    const audioDir = path.resolve("./public/audio");
    console.log("Audio directory:", audioDir);

    // Create the audio directory if it doesn't exist
    await fs.mkdir(audioDir, { recursive: true });

    const speechFile = path.join(audioDir, outputFileName);
    console.log("Speech file path:", speechFile);

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.writeFile(speechFile, buffer);

    // Verify file exists and is readable
    await fs.access(speechFile, fs.constants.R_OK);
    console.log(`Speech file verified: ${speechFile}`);

    // List contents of audio directory
    const files = await fs.readdir(audioDir);
    console.log("Files in audio directory:", files);

    return `/audio/${outputFileName}`;
  } catch (error) {
    console.error("Error generating or verifying speech file:", error);
    throw new Error(`Failed to generate or verify speech: ${error.message}`);
  }
}

module.exports = { generateSpeech };
