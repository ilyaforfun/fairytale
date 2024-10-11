const express = require('express');
const path = require('path');
const apiRoutes = require('./routes/api');
const fs = require('fs'); // Added fs for reading directory

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

// Add this logging middleware
app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'client/dist')));

// Serve static files from the public directory
app.use('/audio', express.static(path.join(__dirname, 'public', 'audio')));

// Explicitly serve audio files with logging
app.use('/audio', (req, res, next) => {
  console.log(`Audio file requested: ${req.url}`);
  const audioPath = path.join(__dirname, 'public', 'audio', req.url);
  res.sendFile(audioPath, (err) => {
    if (err) {
      console.error(`Error serving audio file: ${err.message}`);
      next(err);
    } else {
      console.log(`Successfully served audio file: ${audioPath}`);
    }
  });
});

app.use('/api', apiRoutes);

// For any other route, serve the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

// Test route for audio files
app.get('/test-audio', (req, res) => {
  const testAudioPath = path.join(__dirname, 'public', 'audio', 'test_speech.mp3');
  res.sendFile(testAudioPath, (err) => {
    if (err) {
      console.error(`Error serving test audio file: ${err.message}`);
      res.status(404).send('Audio file not found');
    }
  });
});

// Route to check the contents of the audio directory
app.get('/check-audio', async (req, res) => {
  try {
    const audioDir = path.join(__dirname, 'public', 'audio');
    const files = await fs.readdir(audioDir);
    res.json({ files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
