document.addEventListener('DOMContentLoaded', () => {
    const storyForm = document.getElementById('story-form');
    const loadingDiv = document.getElementById('loading');
    const storyContainer = document.getElementById('story-container');
    const storyTitle = document.getElementById('story-title');
    const storyImage = document.getElementById('story-image');
    const storyText = document.getElementById('story-text');
    const saveBtn = document.getElementById('save-btn');
    const printBtn = document.getElementById('print-btn');

    storyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const childName = document.getElementById('childName').value;
        const childAge = document.getElementById('childAge').value;
        const childInterests = document.getElementById('childInterests').value;

        loadingDiv.classList.remove('d-none');
        storyContainer.classList.add('d-none');

        try {
            const response = await fetch('/api/generate-story', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ childName, childAge, childInterests }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate story');
            }

            const data = await response.json();
            storyTitle.textContent = data.title;
            storyImage.src = data.imageUrl;
            storyText.innerHTML = data.story.replace(/\n/g, '<br>');

            loadingDiv.classList.add('d-none');
            storyContainer.classList.remove('d-none');
        } catch (error) {
            console.error('Error:', error);
            alert('Oops! Something went wrong. Please try again.');
            loadingDiv.classList.add('d-none');
        }
    });

    saveBtn.addEventListener('click', () => {
        const storyContent = `
            ${storyTitle.textContent}
            
            ${storyText.innerText}
        `;
        const blob = new Blob([storyContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my_fairytale.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    printBtn.addEventListener('click', () => {
        window.print();
    });
});
