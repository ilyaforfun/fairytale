const express = require('express');
const router = express.Router();
const storyGenerator = require('../services/storyGenerator');
const imageGenerator = require('../services/imageGenerator');

router.post('/initialize-story', async (req, res) => {
    try {
        const { childName, childAge, childInterests, bookType } = req.body;

        console.log('Received request:', { childName, childAge, childInterests, bookType });

        const story = await storyGenerator.initializeStory(childName, childAge, childInterests, bookType);

        console.log('Generated initial story:', story);

        res.json({
            title: story.title,
            content: story.content,
            choices: story.choices
        });
    } catch (error) {
        console.error('Error initializing story:', error);
        res.status(500).json({ error: 'Failed to initialize story', details: error.message });
    }
});

router.post('/continue-story', async (req, res) => {
    try {
        const { choice } = req.body;

        console.log('Received continuation request:', { choice });

        const continuation = await storyGenerator.continueStory(choice);

        console.log('Generated story continuation:', continuation);

        res.json({
            content: continuation.content
        });
    } catch (error) {
        console.error('Error continuing story:', error);
        res.status(500).json({ error: 'Failed to continue story', details: error.message });
    }
});

router.post('/generate-image', async (req, res) => {
    try {
        const { storyTitle, isColoringBook } = req.body;

        console.log('Received image generation request:', { storyTitle, isColoringBook });

        const imageUrl = await imageGenerator.generateImage(storyTitle, isColoringBook);

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

module.exports = router;
