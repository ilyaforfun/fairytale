const express = require('express');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'client/dist')));

app.use('/api', apiRoutes);

// For any other route, serve the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

// Check if CLAUDE_API_KEY is set
if (process.env.CLAUDE_API_KEY) {
  console.log('CLAUDE_API_KEY is set in the environment');
} else {
  console.log('WARNING: CLAUDE_API_KEY is not set in the environment');
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
