const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

let lastPrompt = '';

async function generateStory(childName, childAge, childInterests, bookType) {
  const isColoringBook = bookType === 'coloring';
  const coloringBookPrompt = isColoringBook ? "The story should be suitable for a coloring book, with clear, distinct scenes that can be easily illustrated as black and white line drawings." : "";

  lastPrompt = `Create a short, age-appropriate fairytale for a ${childAge}-year-old child named ${childName} who likes ${childInterests}. The story should be no more than 500 words, have a clear moral lesson, and be suitable for children. ${coloringBookPrompt} Include a title for the story.`;

  console.log('Story generation prompt:', lastPrompt);

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      messages: [{ role: 'user', content: lastPrompt }]
    });

    const storyContent = response.content[0].text;
    const [title, ...contentArray] = storyContent.split('\n\n');

    return {
      title: title.replace('Title: ', '').trim(),
      content: contentArray.join('\n\n').trim()
    };
  } catch (error) {
    console.error('Error generating story:', error);
    throw error;
  }
}

function getLastPrompt() {
  return lastPrompt;
}

module.exports = { generateStory, getLastPrompt };
