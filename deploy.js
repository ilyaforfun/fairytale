const { exec } = require('child_process');
const http = require('http');
const killPort = require('kill-port');
const net = require('net');

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

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => {
      resolve(false);
    });
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

function forceKillNodeProcesses() {
  return new Promise((resolve, reject) => {
    exec('pkill -f "node server.js"', (error) => {
      if (error) {
        console.error(`Error forcefully stopping Node processes: ${error.message}`);
        reject(error);
      } else {
        console.log('Node processes forcefully stopped');
        resolve();
      }
    });
  });
}

async function stopServer() {
  console.log('Attempting to stop the server...');
  try {
    await killPort(8000);
    console.log('Server stopped successfully using kill-port');
    await forceKillNodeProcesses();
    
    // Wait for 60 seconds to ensure all processes are stopped
    await new Promise(resolve => setTimeout(resolve, 60000));
    
    const running = await new Promise(resolve => isServerRunning(resolve));
    if (running) {
      console.error('Server is still running after multiple stop attempts');
      return false;
    } else {
      console.log('Server successfully stopped');
      return true;
    }
  } catch (error) {
    console.error(`Error stopping server: ${error.message}`);
    await forceKillNodeProcesses();
    return false;
  }
}

async function startServer(retryCount = 0) {
  console.log(`Checking if port 8000 is available (attempt ${retryCount + 1})...`);
  const available = await isPortAvailable(8000);
  
  if (!available) {
    console.error('Port 8000 is not available.');
    if (retryCount < 3) {
      console.log(`Retrying to check port availability in 30 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 30000));
      return startServer(retryCount + 1);
    } else {
      console.error('Failed to start server after 3 attempts. Port 8000 is not available.');
      return;
    }
  }

  console.log(`Starting server (attempt ${retryCount + 1})...`);
  return new Promise((resolve, reject) => {
    exec('node server.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error starting server: ${error.message}`);
        if (retryCount < 3) {
          console.log(`Retrying to start server in 30 seconds...`);
          setTimeout(() => startServer(retryCount + 1).then(resolve).catch(reject), 30000);
        } else {
          console.error('Failed to start server after 3 attempts');
          reject(error);
        }
        return;
      }
      if (stderr) {
        console.error(`Server startup error: ${stderr}`);
        reject(new Error(stderr));
        return;
      }
      console.log(`Server started successfully: ${stdout}`);
      resolve();
    });
  });
}

async function deploymentProcess() {
  console.log('Starting deployment process...');
  const running = await new Promise(resolve => isServerRunning(resolve));
  
  if (running) {
    console.log('Server is already running. Stopping it before redeployment...');
    const stopped = await stopServer();
    if (stopped) {
      console.log('Starting new server instance...');
      await new Promise(resolve => setTimeout(resolve, 60000)); // Wait for 60 seconds before starting new server
      await startServer();
    } else {
      console.error('Failed to stop the server. Aborting deployment.');
    }
  } else {
    console.log('No existing server detected. Starting new server instance...');
    await startServer();
  }
}

deploymentProcess().catch(error => {
  console.error('Deployment process failed:', error);
});
