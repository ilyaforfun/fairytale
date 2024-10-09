const storyGenerator = require('./services/storyGenerator');
const imageGenerator = require('./services/imageGenerator');

async function testStoryAndImageGeneration() {
  try {
    console.log('Initializing story...');
    const story = await storyGenerator.initializeStory('Alice', 7, 'space adventure', 'pictured');
    console.log('Story initialized:', story);

    console.log('\nGenerating image...');
    const imageUrl = await imageGenerator.generateImage(story.title, story.imagePrompt);
    console.log('Image URL:', imageUrl);

    console.log('\nContinuing story...');
    const continuation = await storyGenerator.continueStory(story.choices.A);
    console.log('Story continued:', continuation);

    console.log('\nGenerating second image...');
    const secondImageUrl = await imageGenerator.generateImage(story.title, continuation.imagePrompt);
    console.log('Second Image URL:', secondImageUrl);

  } catch (error) {
    console.error('Error during test:', error);
  }
}

testStoryAndImageGeneration();
