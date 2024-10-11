const OpenAI = require("openai");
const fs = require("fs").promises;
const path = require("path");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function sanitizeFileName(fileName) {
  // Remove or replace special characters
  return fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

async function generateSpeech(text, outputFileName) {
  try {
    const audioDir = path.resolve("./public/audio");
    
    // Create the audio directory if it doesn't exist
    await fs.mkdir(audioDir, { recursive: true });

    const sanitizedFileName = sanitizeFileName(outputFileName);
    const speechFile = path.join(audioDir, sanitizedFileName);

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "onyx",
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.writeFile(speechFile, buffer);

    console.log(`Speech file generated: ${speechFile}`);
    return `/api/audio/${outputFileName}`;
  } catch (error) {
    console.error("Error generating speech:", error);
    throw new Error(`Failed to generate speech: ${error.message}`);
  }
}

module.exports = { generateSpeech };
