const { initializeStory } = require('./services/storyGenerator');

async function testStoryGeneration() {
  const testCases = [
    { name: 'Alice', age: 8, interests: 'princess', bookType: 'pictured' },
    { name: 'Bob', age: 6, interests: 'space', bookType: 'coloring' },
    { name: 'Charlie', age: 10, interests: 'dinosaurs', bookType: 'pictured' },
  ];

  for (const testCase of testCases) {
    console.log(`Testing with input: ${JSON.stringify(testCase)}`);
    try {
      const result = await initializeStory(testCase.name, testCase.age, testCase.interests, testCase.bookType);
      console.log('Story generated successfully:');
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error generating story:', error.message);
    }
    console.log('---');
  }
}

testStoryGeneration();
