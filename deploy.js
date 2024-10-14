const { exec } = require('child_process');
const http = require('http');

// Function to check if the server is already running
function isServerRunning(callback) {
  http.get('http://localhost:8000', (res) => {
    if (res.statusCode === 200) {
      callback(true);
    } else {
      callback(false);
    }
  }).on('error', () => {
    callback(false);
  });
}

// Check if the server is running
isServerRunning((running) => {
  if (running) {
    console.log('Server is already running. Deployment complete.');
  } else {
    console.log('Starting server...');
    exec('node server.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });
  }
});
