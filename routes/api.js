const express = require('express');
const router = express.Router();
const storyGenerator = require('../services/storyGenerator');
const imageGenerator = require('../services/imageGenerator');
const pdfGenerator = require('../services/pdfGenerator');
const path = require('path');

router.post('/initialize-story', async (req, res) => {
    try {
        const { childName, childAge, childInterests, bookType } = req.body;

        console.log('Received request:', { childName, childAge, childInterests, bookType });

        const story = await storyGenerator.initializeStory(childName, childAge, childInterests, bookType);

        console.log('Generated initial story:', story);

        res.json({
            title: story.title,
            content: story.content,
            choices: story.choices,
            imagePrompt: story.imagePrompt
        });
    } catch (error) {
        console.error('Error initializing story:', error);
        res.status(500).json({ error: 'Failed to initialize story', details: error.message });
    }
});

router.post('/continue-story', async (req, res) => {
    try {
        const { choice, childName } = req.body;

        console.log('Received continuation request:', { choice, childName });

        const continuation = await storyGenerator.continueStory(choice, childName);

        console.log('Generated story continuation:', continuation);

        res.json({
            content: continuation.content,
            imagePrompt: continuation.imagePrompt
        });
    } catch (error) {
        console.error('Error continuing story:', error);
        res.status(500).json({ error: 'Failed to continue story', details: error.message });
    }
});

router.post('/generate-image', async (req, res) => {
    try {
        const { imagePrompt, isColoringBook } = req.body;

        console.log('Received image generation request:', { imagePrompt, isColoringBook });

        const imageUrl = await imageGenerator.generateImage(imagePrompt, isColoringBook);

        console.log('Generated image URL:', imageUrl);

        res.json({ imageUrl });
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({ error: 'Failed to generate image', details: error.message });
    }
});

router.get('/prompts', (req, res) => {
    const storyPrompt = storyGenerator.getLastPrompt();
    const imagePrompt = imageGenerator.getLastPrompt();

    res.json({
        storyPrompt: storyPrompt,
        imagePrompt: imagePrompt
    });
});

router.post('/generate-pdf', async (req, res) => {
    try {
        const { story, imageUrl } = req.body;

        console.log('Received PDF generation request:', { story: story.title, imageUrl });

        const pdfFilename = await pdfGenerator.generatePDF(story, imageUrl);

        console.log('Generated PDF:', pdfFilename);

        res.json({ pdfUrl: `/pdfs/${pdfFilename}` });
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
    }
});

router.get('/pdfs/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'public', 'pdfs', filename);
    res.sendFile(filePath);
});

module.exports = router;