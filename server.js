const express = require('express');
const path = require('path');
const apiRoutes = require('./routes/api');

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
app.use(express.static(path.join(__dirname, 'public')));

// Explicitly serve audio files
app.use('/audio', express.static(path.join(__dirname, 'public/audio')));

app.use('/api', apiRoutes);

// For any other route, serve the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
