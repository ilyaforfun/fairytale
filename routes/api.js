const express = require('express');
const router = express.Router();
const storyGenerator = require('../services/storyGenerator');
const imageGenerator = require('../services/imageGenerator');
const textToSpeech = require('../services/textToSpeech');
const multer = require('multer');

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB limit for Leonardo AI
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Configure multer with file validation
const upload = multer({
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed.'));
    }
    cb(null, true);
  }
});

router.post('/initialize-story', async (req, res) => {
    try {
        const { childName, childAge, childInterests, bookType, characterAttributes, uploadedImageId } = req.body;

        console.log('Story initialization request:', { 
            childName, childAge, childInterests, bookType, 
            characterAttributes, uploadedImageId 
        });

        const storyData = await storyGenerator.initializeStory(
            childName, 
            childAge, 
            childInterests, 
            bookType, 
            characterAttributes,
            uploadedImageId
        );

        res.json({
            ...storyData,
            uploadedImageId
        });
    } catch (error) {
        console.error('Error in story initialization:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/continue-story', async (req, res) => {
    try {
        const { choice, childName, characterAttributes } = req.body;
        const result = await storyGenerator.continueStory(choice, childName, characterAttributes);
        res.json(result);
    } catch (error) {
        console.error('Error continuing story:', error);
        res.status(500).json({ error: 'Failed to continue story' });
    }
});

router.post('/generate-image', async (req, res) => {
    let { imagePrompt, isColoringBook, uploadedImageId } = req.body;
    
    // If uploadedImageId is not provided in the request, get it from the story generator
    if (!uploadedImageId) {
        uploadedImageId = storyGenerator.getUploadedImageId();
    }
    
    console.log('Generate image request:', { 
        imagePrompt, isColoringBook, uploadedImageId 
    });
    
    try {
        const imageUrl = await imageGenerator.generateImage(
            imagePrompt,
            isColoringBook,
            uploadedImageId
        );
        res.json({ imageUrl });
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({ error: error.message });
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

router.post('/generate-variations', async (req, res) => {
    try {
        const { imageUrl, count } = req.body;
        const variations = await imageGenerator.getVariations(imageUrl, count);
        res.json({ variations });
    } catch (error) {
        console.error('Error generating variations:', error);
        res.status(500).json({ error: 'Failed to generate variations', details: error.message });
    }
});

router.post('/upload-character-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('Processing upload:', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    const uploadedImageId = await imageGenerator.uploadImage(req.file);
    res.json({ success: true, imageId: uploadedImageId });
  } catch (error) {
    console.error('Error handling image upload:', error);
    res.status(500).json({ 
      error: 'Failed to upload image', 
      details: error.message 
    });
  }
});

module.exports = router;