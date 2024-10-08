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
  
  const prompt = `Create the introduction for a short, age-appropriate fairytale for a ${childAge}-year-old child named ${childName} who likes ${childInterests}. The story should have a clear moral lesson and be suitable for children. ${coloringBookPrompt} Include a title for the story. 

After the introduction, provide two distinct options for what ${childName} could do next. Format these options as:
CHOICE A: [First option]
CHOICE B: [Second option]`;
  
  try {
    console.log("Initializing story with prompt:", prompt);
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });
    
    const storyContent = response.content[0].text;
    const [title, ...contentArray] = storyContent.split("\n\n");
    const mainContent = contentArray.slice(0, -1).join("\n\n").trim();
    const choices = contentArray[contentArray.length - 1].split("\n");

    storyContext = mainContent;
    currentStage = 1;
    
    console.log("Story initialized successfully");
    return {
      title: title.replace("Title: ", "").trim(),
      content: mainContent,
      choices: {
        A: choices[0].replace("CHOICE A: ", "").trim(),
        B: choices[1].replace("CHOICE B: ", "").trim(),
      },
      stage: currentStage,
    };
  } catch (error) {
    console.error("Error initializing story:", error);
    if (error.response) {
      console.error("API response status:", error.response.status);
      console.error("API response data:", error.response.data);
    }
    throw new Error(`Failed to initialize story: ${error.message}`);
  }
}

async function continueStory(choice) {
  if (currentStage >= 5) {
    return { content: "The story has reached its conclusion.", stage: currentStage };
  }

  const prompt = `
  ${storyContext}

  The child chose: ${choice}

  Continue the story based on this choice. Remember to maintain the tone and style of a fairytale for children. 

  ${currentStage < 4 ? `After this part, provide two new distinct options for what the child could do next. Format these options as:
  CHOICE A: [First option]
  CHOICE B: [Second option]` : "This is the final (fifth) stage of the story. Provide a satisfying conclusion."}
  `;

  try {
    console.log("Continuing story with prompt:", prompt);
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const newContent = response.content[0].text;
    const contentArray = newContent.split("\n\n");
    const mainContent = contentArray.slice(0, -1).join("\n\n").trim();
    const choices = currentStage < 4 ? contentArray[contentArray.length - 1].split("\n") : null;

    storyContext += `\n\n${choice}\n\n${mainContent}`;
    currentStage++;

    console.log("Story continued successfully");
    return {
      content: mainContent,
      choices: choices ? {
        A: choices[0].replace("CHOICE A: ", "").trim(),
        B: choices[1].replace("CHOICE B: ", "").trim(),
      } : null,
      stage: currentStage,
    };
  } catch (error) {
    console.error("Error continuing story:", error);
    if (error.response) {
      console.error("API response status:", error.response.status);
      console.error("API response data:", error.response.data);
    }
    throw new Error(`Failed to continue story: ${error.message}`);
  }
}

function getCurrentStage() {
  return currentStage;
}

function getStoryContext() {
  return storyContext;
}

module.exports = { initializeStory, continueStory, getCurrentStage, getStoryContext };
