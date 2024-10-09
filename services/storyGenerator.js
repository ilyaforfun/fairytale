const Anthropic = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

let lastPrompt = '';
let storyContext = '';
let lastImagePrompt = '';

async function initializeStory(childName, childAge, childInterests, bookType) {
  const isColoringBook = bookType === 'coloring';
  const coloringBookPrompt = isColoringBook 
    ? "The story should be suitable for a coloring book, with clear, distinct scenes that can be easily illustrated as black and white line drawings." 
    : "";
  
  lastPrompt = `Create the beginning of a short, age-appropriate fairytale for a ${childAge}-year-old child named ${childName} who likes ${childInterests}. The story should be no more than 250 words, start to set up a clear moral lesson, and be suitable for children. ${coloringBookPrompt} Include a title for the story. At the end, provide two distinct options for what ${childName} could do next. Format these options as:
CHOICE A: [First option]
CHOICE B: [Second option]

After the story and choices, on a new line, provide a brief image prompt that captures the essence of this part of the story for illustration. Start this line with "IMAGE PROMPT:"`;

  console.log('Story initialization prompt:', lastPrompt);
  
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      messages: [{ role: 'user', content: lastPrompt }]
    });

    console.log('Claude API response:', JSON.stringify(response, null, 2));

    if (!response.content || !Array.isArray(response.content) || response.content.length === 0) {
      throw new Error('Unexpected response format from Claude API');
    }

    const storyContent = response.content[0].text;
    if (!storyContent) {
      throw new Error('Story content is empty');
    }

    const titleMatch = storyContent.match(/Title:\s*(.*)/);
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled Story';

    const choicesMatch = storyContent.match(/CHOICE A:[\s\S]*CHOICE B:[\s\S]*/);
    if (!choicesMatch) {
      throw new Error('Choices are not in the expected format');
    }

    const choicesText = choicesMatch[0];
    const choices = {
      A: choicesText.match(/CHOICE A:\s*(.*?)(?=\n|$)/)[1].trim(),
      B: choicesText.match(/CHOICE B:\s*(.*?)(?=\n|$)/)[1].trim()
    };

    const imagePromptMatch = storyContent.match(/IMAGE PROMPT:\s*(.*)/);
    lastImagePrompt = imagePromptMatch ? imagePromptMatch[1].trim() : '';

    const mainContent = storyContent
      .replace(/Title:.*/, '')
      .replace(/CHOICE A:[\s\S]*/, '')
      .replace(/IMAGE PROMPT:.*/, '')
      .trim();

    storyContext = mainContent;

    return {
      title: title,
      content: mainContent,
      choices: choices,
      imagePrompt: lastImagePrompt
    };
  } catch (error) {
    console.error('Error initializing story:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    throw new Error(`Failed to initialize story: ${error.message}`);
  }
}

async function continueStory(choice) {
  lastPrompt = `Continue the fairytale based on the following context and the child's choice. The continuation should be no more than 250 words, complete the moral lesson, and provide a satisfying conclusion to the story.

Story context:
${storyContext}

The child chose: ${choice}

Please continue and conclude the story based on this choice.

After the story conclusion, on a new line, provide a brief image prompt that captures the essence of this part of the story for illustration. Start this line with "IMAGE PROMPT:"`;

  console.log('Story continuation prompt:', lastPrompt);

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      messages: [{ role: 'user', content: lastPrompt }]
    });

    if (!response.content || !Array.isArray(response.content) || response.content.length === 0) {
      throw new Error('Unexpected response format from Claude API');
    }

    const continuationContent = response.content[0].text.trim();

    const imagePromptMatch = continuationContent.match(/IMAGE PROMPT:\s*(.*)/);
    lastImagePrompt = imagePromptMatch ? imagePromptMatch[1].trim() : '';

    const mainContent = continuationContent.replace(/IMAGE PROMPT:.*/, '').trim();

    storyContext += `\n\n${choice}\n\n${mainContent}`;

    return {
      content: mainContent,
      imagePrompt: lastImagePrompt
    };
  } catch (error) {
    console.error('Error continuing story:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    throw new Error(`Failed to continue story: ${error.message}`);
  }
}

function getLastPrompt() {
  return lastPrompt;
}

function getFullStory() {
  return storyContext;
}

function getLastImagePrompt() {
  return lastImagePrompt;
}

module.exports = { initializeStory, continueStory, getLastPrompt, getFullStory, getLastImagePrompt };
