const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

let lastPrompt = '';
let storyContext = '';

async function initializeStory(childName, childAge, childInterests, bookType) {
  const isColoringBook = bookType === 'coloring';
  const coloringBookPrompt = isColoringBook 
    ? "The story should be suitable for a coloring book, with clear, distinct scenes that can be easily illustrated as black and white line drawings." 
    : "";
  
  lastPrompt = `Create the beginning of a short, age-appropriate fairytale for a ${childAge}-year-old child named ${childName} who likes ${childInterests}. The story should be no more than 250 words, start to set up a clear moral lesson, and be suitable for children. ${coloringBookPrompt} Include a title for the story. At the end, provide two distinct options for what ${childName} could do next. Format these options as:
CHOICE A: [First option]
CHOICE B: [Second option]

After the story and choices, provide a separate, detailed image prompt that captures the essence of this part of the story. The image prompt should describe a scene that a child would enjoy seeing illustrated. Format this as:
IMAGE PROMPT: [Detailed image description]`;

  console.log('Story initialization prompt:', lastPrompt);

  try {
    const response = await anthropic.completions.create({
      model: "claude-2.1",
      max_tokens_to_sample: 1000,
      prompt: `Human: ${lastPrompt}\n\nAssistant:`,
    });

    if (!response || !response.completion) {
      throw new Error('Unexpected response format from Anthropic API');
    }

    const storyContent = response.completion.trim();
    console.log('Raw API response:', storyContent);

    const titleMatch = storyContent.match(/Title:\s*(.*)/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled Story';

    const choicesMatch = storyContent.match(/CHOICE A:[\s\S]*CHOICE B:[\s\S]*/i);
    let choices = { A: '', B: '' };
    if (choicesMatch) {
      const choicesText = choicesMatch[0];
      const choiceAMatch = choicesText.match(/CHOICE A:\s*(.*)/i);
      const choiceBMatch = choicesText.match(/CHOICE B:\s*(.*)/i);
      if (choiceAMatch) choices.A = choiceAMatch[1].trim();
      if (choiceBMatch) choices.B = choiceBMatch[1].trim();
    }

    const imagePromptMatch = storyContent.match(/IMAGE PROMPT:\s*([\s\S]*?)$/);
    const imagePrompt = imagePromptMatch ? imagePromptMatch[1].trim() : '';

    const mainContent = storyContent
      .replace(/Title:.*/, '')
      .replace(/CHOICE A:[\s\S]*CHOICE B:[\s\S]*/, '')
      .replace(/IMAGE PROMPT:[\s\S]*/, '')
      .trim();

    storyContext = mainContent;

    return {
      title: title,
      content: mainContent,
      choices: choices,
      imagePrompt: imagePrompt
    };
  } catch (error) {
    console.error('Error initializing story:', error);
    throw error;
  }
}

async function continueStory(choice) {
  lastPrompt = `Continue the fairytale based on the following context and the child's choice. The continuation should be no more than 250 words, complete the moral lesson, and provide a satisfying conclusion to the story.

Story context:
${storyContext}

The child chose: ${choice}

Please continue and conclude the story based on this choice.

After the story conclusion, provide a separate, detailed image prompt that captures the essence of this part of the story. The image prompt should describe a scene that a child would enjoy seeing illustrated. Format this as:
IMAGE PROMPT: [Detailed image description]`;

  console.log('Story continuation prompt:', lastPrompt);

  try {
    const response = await anthropic.completions.create({
      model: "claude-2.1",
      max_tokens_to_sample: 1000,
      prompt: `Human: ${lastPrompt}\n\nAssistant:`,
    });

    if (!response || !response.completion) {
      throw new Error('Unexpected response format from Anthropic API');
    }

    const continuationContent = response.completion.trim();
    
    const imagePromptMatch = continuationContent.match(/IMAGE PROMPT:\s*([\s\S]*?)$/);
    const imagePrompt = imagePromptMatch ? imagePromptMatch[1].trim() : '';

    const mainContent = continuationContent
      .replace(/IMAGE PROMPT:[\s\S]*/, '')
      .trim();

    storyContext += `\n\n${choice}\n\n${mainContent}`;

    return {
      content: mainContent,
      imagePrompt: imagePrompt
    };
  } catch (error) {
    console.error('Error continuing story:', error);
    throw error;
  }
}

function getLastPrompt() {
  return lastPrompt;
}

function getFullStory() {
  return storyContext;
}

module.exports = { initializeStory, continueStory, getLastPrompt, getFullStory };
