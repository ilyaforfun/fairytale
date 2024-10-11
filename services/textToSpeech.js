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

    console.log('Generating speech with text:', text.substring(0, 100) + '...');
    console.log('Output file:', speechFile);

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "onyx",
      input: text,
    });

    console.log('Speech generated successfully, writing to file...');

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.writeFile(speechFile, buffer);

    console.log(`Speech file generated: ${speechFile}`);
    return `/audio/${outputFileName}`;
  } catch (error) {
    console.error("Error generating speech:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    if (error.response) {
      console.error("OpenAI API response:", error.response.data);
    }
    throw new Error(`Failed to generate speech: ${error.message}`);
  }
}

module.exports = { generateSpeech };
