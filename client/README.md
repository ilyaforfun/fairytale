# AI-Powered Fairytale Generator

An interactive web application that generates personalized fairytales for children using AI technology. The application creates unique stories based on the child's name, age, and interests, complete with AI-generated illustrations and text-to-speech capabilities.

## Features

- Personalized story generation using OpenAI's GPT models
- AI-generated illustrations for each story
- Text-to-speech narration
- Interactive story choices
- User authentication
- Mobile-responsive design
- Real-time story generation with loading states

## Tech Stack

### Frontend
- React.js with Vite
- Tailwind CSS
- Framer Motion for animations
- Radix UI components
- Lucide React icons

### Backend
- Node.js
- Express.js
- OpenAI API
- Leonardo AI for image generation
- Text-to-speech services

## Getting Started

### Prerequisites
- Node.js (v20 or later)
- npm or yarn
- OpenAI API key
- Leonardo AI API key

### Installation

1. Clone the repository:
bash
git clone https://github.com/yourusername/fairytale-generator.git
cd fairytale-generator

# Install dependencies:
npm install

# Install client dependencies
cd client
npm install
```

3. Create environment variables:
Create a `.env` file in the root directory and add:
```env
OPENAI_API_KEY=your_openai_api_key
LEONARDO_API_KEY=your_leonardo_api_key
```

4. Start the development servers:
```bash
# Start both frontend and backend
npm run dev
```

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── lib/          # Utility functions
│   │   └── styles/       # CSS styles
├── public/                # Static files
├── services/             # Backend services
├── routes/               # API routes
└── server.js            # Express server
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
```

3. Create a simple LICENSE file (MIT License):

```text
MIT License

Copyright (c) 2024 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
