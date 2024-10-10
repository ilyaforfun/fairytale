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
CHOICE B: [Second option]`;

  console.log('Story initialization prompt:', lastPrompt);

  try {
    const response = await anthropic.completions.create({
      model: "claude-2.1",
      max_tokens_to_sample: 1000,
      prompt: `Human: ${lastPrompt}\n\nAssistant:`,
    });

    const storyContent = response.completion;
    const [title, ...contentArray] = storyContent.split('\n\n');
    const mainContent = contentArray.slice(0, -1).join('\n\n').trim();
    const choices = contentArray[contentArray.length - 1].split('\n');

    storyContext = mainContent;

    return {
      title: title.replace('Title: ', '').trim(),
      content: mainContent,
      choices: {
        A: choices[0].replace('CHOICE A: ', '').trim(),
        B: choices[1].replace('CHOICE B: ', '').trim(),
      }
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

Please continue and conclude the story based on this choice.`;

  console.log('Story continuation prompt:', lastPrompt);

  try {
    const response = await anthropic.completions.create({
      model: "claude-2.1",
      max_tokens_to_sample: 1000,
      prompt: `Human: ${lastPrompt}\n\nAssistant:`,
    });

    const continuationContent = response.completion.trim();
    storyContext += `\n\n${choice}\n\n${continuationContent}`;

    return {
      content: continuationContent,
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
