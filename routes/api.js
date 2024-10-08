const express = require('express');
const router = express.Router();
const storyGenerator = require('../services/storyGenerator');
const imageGenerator = require('../services/imageGenerator');

router.post('/initialize-story', async (req, res) => {
    try {
        const { childName, childAge, childInterests, bookType } = req.body;

        console.log('Initializing story:', { childName, childAge, childInterests, bookType });

        const story = await storyGenerator.initializeStory(childName, childAge, childInterests, bookType);
        const imageUrl = await imageGenerator.generateImage(story.title, bookType === 'coloring');

        console.log('Generated story:', story);
        console.log('Generated image URL:', imageUrl);

        res.json({
            title: story.title,
            content: story.content,
            imageUrl: imageUrl,
            stage: story.stage,
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

        console.log('Continuing story with choice:', choice);

        const story = await storyGenerator.continueStory(choice);
        const currentStage = storyGenerator.getCurrentStage();

        // Generate a new image for the current stage
        const storyContext = storyGenerator.getStoryContext();
        const imageUrl = await imageGenerator.generateImage(storyContext, req.body.bookType === 'coloring');

        console.log('Generated story continuation:', story);
        console.log('Generated image URL:', imageUrl);

        res.json({
            content: story.content,
            imageUrl: imageUrl,
            stage: currentStage,
            choices: story.choices
        });
    } catch (error) {
        console.error('Error continuing story:', error);
        res.status(500).json({ error: 'Failed to continue story', details: error.message });
    }
});

router.get('/prompts', (req, res) => {
    const storyPrompt = storyGenerator.getStoryContext();
    const imagePrompt = imageGenerator.getLastPrompt();

    res.json({
        storyPrompt: storyPrompt,
        imagePrompt: imagePrompt
    });
});

module.exports = router;
