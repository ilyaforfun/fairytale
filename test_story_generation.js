const { initializeStory, continueStory } = require('./services/storyGenerator');

async function testStoryGeneration() {
  try {
    console.log('Testing story initialization...');
    const initialStory = await initializeStory('Alice', 7, 'magic and adventure', 'pictured');
    console.log('Initial story:', JSON.stringify(initialStory, null, 2));

    if (initialStory.choices && initialStory.choices.A) {
      console.log('\nTesting story continuation...');
      const continuedStory = await continueStory(initialStory.choices.A, 'Alice');
      console.log('Continued story:', JSON.stringify(continuedStory, null, 2));
    } else {
      console.log('Error: No choices available for story continuation');
    }
  } catch (error) {
    console.error('Error during story generation:', error);
  }
}

testStoryGeneration();
