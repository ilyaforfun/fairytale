const express = require('express');
const router = express.Router();
const storyGenerator = require('../services/storyGenerator');
const imageGenerator = require('../services/imageGenerator');
const textToSpeech = require('../services/textToSpeech');

// ... (keep other routes unchanged)

router.post('/generate-speech', async (req, res) => {
    try {
        const { text, fileName } = req.body;

        console.log('Received speech generation request:', { text: text.substring(0, 100) + '...', fileName });

        if (!text || !fileName) {
            throw new Error('Missing required parameters: text or fileName');
        }

        const audioUrl = await textToSpeech.generateSpeech(text, fileName);

        console.log('Generated audio URL:', audioUrl);

        res.json({ audioUrl });
    } catch (error) {
        console.error('Error generating speech:', error);
        res.status(500).json({ error: 'Failed to generate speech', details: error.message });
    }
});

module.exports = router;
