const express = require('express');
const path = require('path');
const apiRoutes = require('./routes/api');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'client/dist')));

// Serve static files from the public directory, including audio
app.use('/audio', (req, res, next) => {
  const audioPath = path.join(__dirname, 'public/audio', req.url);
  console.log('Audio file requested:', req.url);
  express.static(path.join(__dirname, 'public/audio'))(req, res, next);
});

app.use('/api', apiRoutes);

// For any other route, serve the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
