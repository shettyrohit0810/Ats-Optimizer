// Root entry point for Railway deployment
// This file redirects to the backend application

const path = require('path');
const { spawn } = require('child_process');

console.log('Starting ATS Optimizer Backend...');

// Change to backend directory and start the application
process.chdir(path.join(__dirname, 'backend'));

// Start the backend application
const child = spawn('npm', ['run', 'start'], {
  stdio: 'inherit',
  shell: true
});

child.on('error', (error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`Backend process exited with code ${code}`);
  process.exit(code);
});
