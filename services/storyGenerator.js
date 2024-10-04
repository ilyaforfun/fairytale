const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

async function generateStory(childName, childAge, childInterests) {
  const prompt = `\n\nHuman: Create a short, age-appropriate fairytale for a ${childAge}-year-old child named ${childName} who likes ${childInterests}. The story should be no more than 500 words, have a clear moral lesson, and be suitable for children. Include a title for the story.