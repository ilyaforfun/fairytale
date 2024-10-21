const fetch = require('node-fetch');
const { initializeStory } = require('./services/storyGenerator');

async function testStoryAPI() {
  try {
    console.log('Testing direct function call:');
    const story = await initializeStory('Alice', 7, 'dragons', 'pictured', {
      Gender: 'Girl',
      'Hair Style': 'Long',
      'Hair Color': 'Blonde',
      'Skin Color': 'Light',
      'Eye Color': 'Blue'
    });

    console.log('Story generated:', JSON.stringify(story, null, 2));

    console.log('\nTesting API endpoint:');
    const response = await fetch('http://localhost:8000/api/initialize-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        childName: 'Alice',
        childAge: 7,
        childInterests: 'dragons',
        bookType: 'pictured',
        characterAttributes: {
          Gender: 'Girl',
          'Hair Style': 'Long',
          'Hair Color': 'Blonde',
          'Skin Color': 'Light',
          'Eye Color': 'Blue'
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error testing story API:', error);
  }
}

testStoryAPI();
