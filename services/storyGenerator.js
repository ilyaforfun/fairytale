const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

async function generateStory(childName, childAge, childInterests) {
  const prompt = `\n\nHuman: Create a short, age-appropriate fairytale for a ${childAge}-year-old child named ${childName} who likes ${childInterests}. The story should be no more than 500 words, have a clear moral lesson, and be suitable for children. Include a title for the story.\n\nAssistant: Certainly! I'd be happy to create a fairytale for ${childName}. Here's a story tailored to their interests:`;

  try {
    const response = await anthropic.completions.create({
      model: 'claude-2',
      prompt: prompt,
      max_tokens_to_sample: 1000,
    });

    const storyContent = response.completion;
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

module.exports = { generateStory };
