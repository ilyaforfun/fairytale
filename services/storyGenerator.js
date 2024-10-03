const openai = require('../utils/openaiConfig');

async function generateStory(childName, childAge, childInterests) {
    const prompt = `Create a short, age-appropriate fairytale for a ${childAge}-year-old child named ${childName} who likes ${childInterests}. The story should be no more than 500 words, have a clear moral lesson, and be suitable for children. Include a title for the story.`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
        });

        const storyContent = response.choices[0].message.content;
        const [title, ...contentArray] = storyContent.split('\n\n');

        return {
            title: title.replace('Title: ', '').trim(),
            content: contentArray.join('\n\n').trim()
        };
    } catch (error) {
        console.error('Error generating story:', error);
        throw error;
    }
}

module.exports = { generateStory };
