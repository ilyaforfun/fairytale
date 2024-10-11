const { generateSpeech } = require('./services/textToSpeech');
const fs = require('fs').promises;
const path = require('path');

async function testTextToSpeech() {
  try {
    const testText = "This is a comprehensive test of the text-to-speech functionality. We are ensuring that the audio directory is created if it doesn't exist, and that the speech file is generated correctly.";
    const outputFileName = "comprehensive_test_speech.mp3";
    
    console.log("Generating speech...");
    const audioUrl = await generateSpeech(testText, outputFileName);
    console.log("Speech generated successfully!");
    console.log("Audio URL:", audioUrl);

    // Verify that the file was created
    const audioDir = path.resolve("./public/audio");
    const filePath = path.join(audioDir, outputFileName);
    const fileStats = await fs.stat(filePath);

    if (fileStats.isFile() && fileStats.size > 0) {
      console.log("Audio file created successfully!");
      console.log("File path:", filePath);
      console.log("File size:", fileStats.size, "bytes");
    } else {
      throw new Error("Audio file was not created or is empty");
    }

  } catch (error) {
    console.error("Error in text-to-speech test:", error);
  }
}

testTextToSpeech();
