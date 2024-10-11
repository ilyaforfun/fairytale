const OpenAI = require("openai");
const fs = require("fs").promises;
const path = require("path");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateSpeech(text, outputFileName) {
  try {
    const audioDir = path.resolve("./public/audio");
    
    // Create the audio directory if it doesn't exist
    await fs.mkdir(audioDir, { recursive: true });

    const speechFile = path.join(audioDir, outputFileName);

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "onyx",
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.writeFile(speechFile, buffer);

    console.log(`Speech file generated: ${speechFile}`);
    return outputFileName; // Return just the filename
  } catch (error) {
    console.error("Error generating speech:", error);
    throw new Error(`Failed to generate speech: ${error.message}`);
  }
}

module.exports = { generateSpeech };
