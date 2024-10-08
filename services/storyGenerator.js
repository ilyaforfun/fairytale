const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

let storyContext = "";
let currentStage = 0;

async function initializeStory(childName, childAge, childInterests, bookType) {
  const isColoringBook = bookType === "coloring";
  const coloringBookPrompt = isColoringBook
    ? "The story should be suitable for a coloring book, with clear, distinct scenes that can be easily illustrated as black and white line drawings."
    : "";
  
  const prompt = `Create the introduction for a short, age-appropriate fairytale for a ${childAge}-year-old child named ${childName} who likes ${childInterests}. The story should have a clear moral lesson and be suitable for children. ${coloringBookPrompt} Include a title for the story. After the introduction, provide two options for what ${childName} could do next.`;
  
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });
    
    const storyContent = response.content[0].text;
    const [title, ...contentArray] = storyContent.split("\n\n");
    storyContext = contentArray.join("\n\n").trim();
    currentStage = 1;
    
    return {
      title: title.replace("Title: ", "").trim(),
      content: storyContext,
      stage: currentStage,
    };
  } catch (error) {
    console.error("Error initializing story:", error);
    throw error;
  }
}

async function continueStory(choice) {
  if (currentStage >= 5) {
    return { content: "The story has reached its conclusion.", stage: currentStage };
  }

  const prompt = `
  ${storyContext}

  ${choice}

  Continue the story based on this choice. Remember to maintain the tone and style of a fairytale for children. After this part, provide two new options for what the main character could do next, unless this is the final (fifth) stage of the story. If it's the final stage, provide a satisfying conclusion.
  `;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const newContent = response.content[0].text;
    storyContext += `\n\n${choice}\n\n${newContent}`;
    currentStage++;

    return {
      content: newContent,
      stage: currentStage,
    };
  } catch (error) {
    console.error("Error continuing story:", error);
    throw error;
  }
}

function getCurrentStage() {
  return currentStage;
}

function getStoryContext() {
  return storyContext;
}

module.exports = { initializeStory, continueStory, getCurrentStage, getStoryContext };
