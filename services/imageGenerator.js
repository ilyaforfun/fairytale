const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateImage(storyTitle) {
  const prompt = `Create a colorful, child-friendly illustration for a fairytale titled "${storyTitle}". The image should be suitable for children and reflect the magical nature of the story.`;

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    return response.data[0].url;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

module.exports = { generateImage };
