const { initializeStory, continueStory } = require('./services/storyGenerator');
const { generateImage } = require('./services/imageGenerator');

async function testStoryGeneration() {
  const testCase = { name: 'Alice', age: 8, interests: 'princess', bookType: 'pictured' };

  console.log(`Testing with input: ${JSON.stringify(testCase)}`);
  try {
    const initialStory = await initializeStory(testCase.name, testCase.age, testCase.interests, testCase.bookType);
    console.log('Initial story generated successfully:');
    console.log(JSON.stringify(initialStory, null, 2));

    if (!initialStory.imagePrompt) {
      throw new Error('Image prompt is missing in the initial story');
    }

    const imageUrl = await generateImage(initialStory.imagePrompt, testCase.bookType === 'coloring');
    console.log('Initial image generated successfully:', imageUrl);

    const choice = initialStory.choices.A;
    const continuedStory = await continueStory(choice, testCase.name);
    console.log('Story continuation generated successfully:');
    console.log(JSON.stringify(continuedStory, null, 2));

    if (!continuedStory.imagePrompt) {
      throw new Error('Image prompt is missing in the continued story');
    }

    const continuationImageUrl = await generateImage(continuedStory.imagePrompt, testCase.bookType === 'coloring');
    console.log('Continuation image generated successfully:', continuationImageUrl);
  } catch (error) {
    console.error('Error generating story or image:', error.message);
  }
}

testStoryGeneration();
