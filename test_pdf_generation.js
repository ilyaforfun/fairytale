const fs = require('fs');
const path = require('path');
const { generatePDF } = require('./services/pdfGenerator');

async function testPDFGeneration() {
  const logFile = path.join(__dirname, 'pdf_generation_test.log');
  const log = (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp}: ${message}\n`;
    fs.appendFileSync(logFile, logMessage);
    console.log(message);
  };

  const sampleStory = {
    title: "The Magic of Friendship",
    content: "Once upon a time, in a land far away, there lived a young girl named Lily. Lily was known for her kindness and her love for animals. One day, while walking in the forest, she encountered a magical talking rabbit named Hoppy.\n\nHoppy was in trouble. He had lost his way home and couldn't find his family. Lily, being the kind-hearted girl she was, decided to help Hoppy. Together, they embarked on an adventure through the enchanted forest.\n\nAs they journeyed, they met many other magical creatures - a wise old owl, a mischievous pixie, and a gentle giant. Each of these new friends helped Lily and Hoppy in their quest, teaching them valuable lessons about friendship, courage, and perseverance.\n\nFinally, after overcoming many obstacles and solving tricky riddles, Lily and Hoppy found the hidden rabbit village. Hoppy was reunited with his family, and they were overjoyed to see him.\n\nLily's heart was full of happiness, not just because she had helped Hoppy, but because she had made so many new friends along the way. She realized that the real magic wasn't in the enchanted forest or the magical creatures, but in the power of friendship and kindness.\n\nFrom that day on, Lily visited her new friends in the forest often, and they all lived happily ever after, cherishing the bonds of friendship they had formed during their grand adventure."
  };

  const imageUrl1 = "https://picsum.photos/seed/picsum/800/600";
  const imageUrl2 = "https://picsum.photos/seed/friendship/800/600";

  log("Starting PDF generation test...");

  try {
    log("Generating PDF...");
    log(`Story title: ${sampleStory.title}`);
    log(`Story content length: ${sampleStory.content.length} characters`);
    log(`Image URL 1: ${imageUrl1}`);
    log(`Image URL 2: ${imageUrl2}`);

    const startTime = Date.now();
    const pdfFilename = await generatePDF(sampleStory, imageUrl1, imageUrl2);
    const endTime = Date.now();

    log(`PDF generated successfully: ${pdfFilename}`);
    log(`Generation time: ${endTime - startTime}ms`);

    const pdfPath = path.join(__dirname, 'public', 'pdfs', pdfFilename);
    if (fs.existsSync(pdfPath)) {
      const fileStats = fs.statSync(pdfPath);
      log(`PDF file size: ${fileStats.size} bytes`);
      
      if (fileStats.size > 0) {
        log("PDF file size is greater than 0 bytes, indicating content was written successfully.");
      } else {
        log("Warning: PDF file size is 0 bytes. The file may be empty.");
      }
    } else {
      log(`Error: PDF file not found at ${pdfPath}`);
    }

    log("PDF generation test completed successfully.");
  } catch (error) {
    log('Error generating PDF:');
    log(error.message);
    log('Stack trace:');
    log(error.stack);
  }
}

testPDFGeneration().then(() => {
  console.log("Test script finished. Check pdf_generation_test.log for details.");
});
