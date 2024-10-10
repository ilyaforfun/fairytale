const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function generatePDF(story, imageUrl1, imageUrl2) {
  return new Promise(async (resolve, reject) => {
    console.log('Starting PDF generation process');
    const doc = new PDFDocument({ autoFirstPage: false });
    const filename = `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    const filePath = path.join(__dirname, '..', 'public', 'pdfs', filename);

    console.log(`Creating PDF file: ${filePath}`);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.on('error', (err) => {
      console.error('Error in PDF document:', err);
      reject(err);
    });

    stream.on('error', (err) => {
      console.error('Error in write stream:', err);
      reject(err);
    });

    try {
      // Check if story content is empty
      if (!story.content || story.content.trim().length === 0) {
        throw new Error('Story content is empty');
      }

      // Add a new page with margins
      console.log('Adding new page to PDF');
      doc.addPage({ margin: 50 });

      // Add title
      console.log('Adding title to PDF');
      doc.fontSize(24).font('Helvetica-Bold').text(story.title, { align: 'center' });
      doc.moveDown(2);

      // Function to add image with retry mechanism
      const addImage = async (url, retries = 3) => {
        for (let i = 0; i < retries; i++) {
          try {
            console.log(`Fetching image from URL: ${url} (Attempt ${i + 1})`);
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data, 'binary');
            console.log('Adding image to PDF');
            const imgDimensions = doc.image(imageBuffer, { fit: [500, 300], align: 'center' });
            doc.moveDown();
            return imgDimensions;
          } catch (error) {
            console.error(`Error adding image to PDF (Attempt ${i + 1}):`, error.message);
            if (i === retries - 1) {
              doc.text('Image could not be loaded', { align: 'center', italics: true });
              doc.moveDown();
              return null;
            }
          }
        }
      };

      // Add first image
      console.log('Adding first image to PDF');
      await addImage(imageUrl1);

      // Add first part of the story
      console.log('Adding first part of the story to PDF');
      const midpoint = Math.floor(story.content.length / 2);
      doc.fontSize(12).font('Helvetica').text(story.content.slice(0, midpoint), { align: 'justify' });
      doc.moveDown();

      // Check if we need to add a new page
      if (doc.y > 700) {
        console.log('Adding new page for second part of the story');
        doc.addPage();
      }

      // Add second image
      console.log('Adding second image to PDF');
      await addImage(imageUrl2);

      // Add second part of the story
      console.log('Adding second part of the story to PDF');
      doc.text(story.content.slice(midpoint), { align: 'justify' });

      // Add page numbers
      console.log('Adding page numbers to PDF');
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(10).text(`Page ${i + 1} of ${pages.count}`, 50, doc.page.height - 50, {
          align: 'center',
        });
      }

      console.log('Finalizing PDF generation');
      doc.end();

      stream.on('finish', () => {
        console.log(`PDF generation completed: ${filename}`);
        resolve(filename);
      });
    } catch (error) {
      console.error('Error during PDF generation:', error.message);
      doc.end();
      reject(error);
    }
  });
}

module.exports = { generatePDF };
