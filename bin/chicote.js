#!/usr/bin/env node
const path = require('path');
const { spawn } = require('child_process');

let electronBinary;
try {
  electronBinary = require('electron');
} catch (e) {
  console.error('Could not load Electron. Run: npm install');
  process.exit(1);
}

const child = spawn(electronBinary, [path.resolve(__dirname, '..')], {
  detached: true,
  stdio: 'ignore',
  windowsHide: true,
});

child.on('error', (err) => {
  console.error('Failed to start chicote:', err.message);
  process.exit(1);
});

child.unref();
