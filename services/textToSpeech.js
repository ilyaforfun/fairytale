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
    
    await fs.mkdir(audioDir, { recursive: true });

    const speechFile = path.join(audioDir, outputFileName);
    console.log("Speech file path:", speechFile);

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "onyx",
      input: text,
      response_format: "mp3"
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.writeFile(speechFile, buffer);
    
    console.log("File written successfully");

    await fs.access(speechFile, fs.constants.R_OK);
    console.log(`Speech file verified: ${speechFile}`);

    const files = await fs.readdir(audioDir);
    console.log("Files in audio directory:", files);

    // Return the relative path, not starting with a slash
    return `audio/${outputFileName}`;
  } catch (error) {
    console.error("Error in generateSpeech:", error);
    throw new Error(`Failed to generate or verify speech: ${error.message}`);
  }
}

module.exports = { generateSpeech };
