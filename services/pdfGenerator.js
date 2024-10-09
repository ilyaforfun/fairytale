const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function generatePDF(story, imageUrl1, imageUrl2) {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument();
    const filename = `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    const filePath = path.join(__dirname, '..', 'public', 'pdfs', filename);

    doc.pipe(fs.createWriteStream(filePath));

    // Add title
    doc.fontSize(24).text(story.title, { align: 'center' });
    doc.moveDown();

    // Function to add image
    const addImage = async (url) => {
      try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');
        doc.image(imageBuffer, {
          fit: [400, 300],
          align: 'center',
          valign: 'center'
        });
        doc.moveDown();
      } catch (error) {
        console.error('Error adding image to PDF:', error);
      }
    };

    // Add first image
    await addImage(imageUrl1);

    // Add first part of the story
    const midpoint = Math.floor(story.content.length / 2);
    doc.fontSize(12).text(story.content.slice(0, midpoint), { align: 'justify' });
    doc.moveDown();

    // Add second image
    await addImage(imageUrl2);

    // Add second part of the story
    doc.fontSize(12).text(story.content.slice(midpoint), { align: 'justify' });

    doc.end();

    doc.on('finish', () => resolve(filename));
    doc.on('error', reject);
  });
}

module.exports = { generatePDF };
