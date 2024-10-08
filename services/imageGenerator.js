const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let lastPrompt = '';

async function generateImage(storyTitle, isColoringBook = false) {
  const basePrompt = `Create a child-friendly illustration for a fairytale titled "${storyTitle}". The image should be suitable for children and reflect the magical nature of the story.`;
  const coloringBookPrompt = `${basePrompt} Make it a black and white line drawing suitable for coloring.`;
  
  lastPrompt = isColoringBook ? coloringBookPrompt : basePrompt;

  console.log('Image generation prompt:', lastPrompt);

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: lastPrompt,
      n: 1,
      size: "1024x1024",
    });

    return response.data[0].url;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

function getLastPrompt() {
  return lastPrompt;
}

module.exports = { generateImage, getLastPrompt };
