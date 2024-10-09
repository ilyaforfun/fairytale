const { initializeStory, continueStory } = require('./services/storyGenerator');

async function testStoryGeneration() {
  const testCases = [
    { name: 'Alice', age: 8, interests: 'princess', bookType: 'pictured' },
    { name: 'Bob', age: 6, interests: 'space', bookType: 'coloring' },
    { name: 'Charlie', age: 10, interests: 'dinosaurs', bookType: 'pictured' },
  ];

  for (const testCase of testCases) {
    console.log(`Testing with input: ${JSON.stringify(testCase)}`);
    try {
      const initialStory = await initializeStory(testCase.name, testCase.age, testCase.interests, testCase.bookType);
      console.log('Initial story generated successfully:');
      console.log(JSON.stringify(initialStory, null, 2));

      if (!initialStory.imagePrompt) {
        throw new Error('Image prompt is missing in the initial story');
      }

      const choice = initialStory.choices.A;
      const continuedStory = await continueStory(choice, testCase.name);
      console.log('Story continuation generated successfully:');
      console.log(JSON.stringify(continuedStory, null, 2));

      if (!continuedStory.imagePrompt) {
        throw new Error('Image prompt is missing in the continued story');
      }
    } catch (error) {
      console.error('Error generating story:', error.message);
    }
    console.log('---');
  }
}

testStoryGeneration();
