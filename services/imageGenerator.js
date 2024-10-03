const openai = require('../utils/openaiConfig');

async function generateImage(storyTitle) {
    const prompt = `Create a colorful, child-friendly illustration for a fairytale titled "${storyTitle}". The image should be suitable for children and reflect the magical nature of the story.`;

    try {
        const response = await openai.images.generate({
            prompt: prompt,
            n: 1,
            size: '512x512',
        });

        return response.data[0].url;
    } catch (error) {
        console.error('Error generating image:', error);
        throw error;
    }
}

module.exports = { generateImage };
