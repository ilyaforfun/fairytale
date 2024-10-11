const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateSpeech(text, outputFileName) {
  try {
    const speechFile = path.resolve(`./public/audio/${outputFileName}`);

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);

    return `/audio/${outputFileName}`;
  } catch (error) {
    console.error('Error generating speech:', error);
    throw error;
  }
}

module.exports = { generateSpeech };
