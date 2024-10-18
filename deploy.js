const { exec } = require('child_process');
const http = require('http');
const killPort = require('kill-port');
const net = require('net');

function isServerRunning(callback) {
  http.get('http://localhost:8000/health', (res) => {
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
  return new Promise((resolve) => {
    exec('pkill -f "node server.js"', (error) => {
      if (error) {
        console.log('No processes found to kill or error occurred. Continuing deployment.');
      } else {
        console.log('Node processes forcefully stopped');
      }
      resolve();
    });
  });
}

async function stopServer() {
  console.log('Attempting to stop the server...');
  try {
    await killPort(8000);
    console.log('Server stopped successfully using kill-port');
  } catch (error) {
    console.log('Error using kill-port. Attempting to force kill processes.');
  }
  
  await forceKillNodeProcesses();
  
  console.log('Waiting for 60 seconds to ensure all processes are stopped...');
  await new Promise(resolve => setTimeout(resolve, 60000));
  
  const running = await new Promise(resolve => isServerRunning(resolve));
  if (running) {
    console.log('Server is still running. Will attempt to start anyway.');
  } else {
    console.log('Server successfully stopped');
  }
}

async function startServer(retryCount = 0) {
  console.log(`Checking if port 8000 is available (attempt ${retryCount + 1})...`);
  const available = await isPortAvailable(8000);
  
  if (!available) {
    console.log('Port 8000 is not available. Attempting to force stop any running processes.');
    await stopServer();
  }

  console.log(`Starting server (attempt ${retryCount + 1})...`);
  return new Promise((resolve, reject) => {
    const serverProcess = exec('node server.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error starting server: ${error.message}`);
        reject(error);
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

    serverProcess.stdout.on('data', (data) => {
      console.log(`Server output: ${data}`);
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`Server error: ${data}`);
    });

    const startupTimeout = setTimeout(() => {
      console.error('Server startup timed out after 10 minutes');
      serverProcess.kill();
      reject(new Error('Server startup timed out'));
    }, 600000); // 10 minutes timeout

    serverProcess.on('exit', (code) => {
      clearTimeout(startupTimeout);
      if (code !== 0) {
        console.error(`Server process exited with code ${code}`);
        reject(new Error(`Server process exited with code ${code}`));
      }
    });
  });
}

async function deploymentProcess() {
  console.log('Starting deployment process...');
  await stopServer();
  
  try {
    await startServer();
    console.log('Deployment successful!');
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

deploymentProcess().catch(error => {
  console.error('Deployment process failed:', error);
  process.exit(1);
});
