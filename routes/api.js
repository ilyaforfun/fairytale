const express = require('express');
const router = express.Router();
const storyGenerator = require('../services/storyGenerator');
const imageGenerator = require('../services/imageGenerator');
const textToSpeech = require('../services/textToSpeech');

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

router.post('/generate-speech', async (req, res) => {
    try {
        const { text, fileName } = req.body;

        console.log('Received speech generation request:', { text, fileName });

        const audioUrl = await textToSpeech.generateSpeech(text, fileName);

        console.log('Generated audio URL:', audioUrl);

        res.json({ audioUrl });
    } catch (error) {
        console.error('Error generating speech:', error);
        res.status(500).json({ error: 'Failed to generate speech', details: error.message });
    }
});

module.exports = router;