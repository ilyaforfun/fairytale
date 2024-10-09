const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

async function generatePDF(story, imageUrl) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const filename = `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    const filePath = path.join(__dirname, '..', 'public', 'pdfs', filename);

    doc.pipe(fs.createWriteStream(filePath));

    // Add title
    doc.fontSize(24).text(story.title, { align: 'center' });
    doc.moveDown();

    // Add image
    if (imageUrl) {
      doc.image(imageUrl, {
        fit: [400, 300],
        align: 'center',
        valign: 'center'
      });
      doc.moveDown();
    }

    // Add story content
    doc.fontSize(12).text(story.content, { align: 'justify' });

    doc.end();

    doc.on('finish', () => resolve(filename));
    doc.on('error', reject);
  });
}

module.exports = { generatePDF };
