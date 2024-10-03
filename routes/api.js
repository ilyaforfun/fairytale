const express = require('express');
const router = express.Router();
const storyGenerator = require('../services/storyGenerator');
const imageGenerator = require('../services/imageGenerator');

router.post('/generate-story', async (req, res) => {
    try {
        const { childName, childAge, childInterests } = req.body;

        const story = await storyGenerator.generateStory(childName, childAge, childInterests);
        const imageUrl = await imageGenerator.generateImage(story.title);

        res.json({
            title: story.title,
            story: story.content,
            imageUrl: imageUrl
        });
    } catch (error) {
        console.error('Error generating story:', error);
        res.status(500).json({ error: 'Failed to generate story' });
    }
});

module.exports = router;
