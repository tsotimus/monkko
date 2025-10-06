#!/usr/bin/env node

const { spawn } = require('child_process');
const { join } = require('path');
const os = require('os');

function getBinaryName() {
  const platform = os.platform();
  const arch = os.arch();

  // Map Node.js platform names to binary suffixes
  const platformMap = {
    'darwin': 'darwin',
    'linux': 'linux',
    'win32': 'windows'
  };

  const goPlatform = platformMap[platform];
  if (!goPlatform) {
    console.error(`❌ Unsupported platform: ${platform}`);
    process.exit(1);
  }

  const extension = platform === 'win32' ? '.exe' : '';
  return `monkko-${goPlatform}${extension}`;
}

function runBinary() {
  const binaryName = getBinaryName();
  const binaryPath = join(__dirname, binaryName);

  // Spawn the binary with all arguments passed through
  const child = spawn(binaryPath, process.argv.slice(2), {
    stdio: 'inherit',
    windowsHide: false
  });

  child.on('error', (err) => {
    if (err.code === 'ENOENT') {
      console.error(`❌ Binary not found: ${binaryPath}`);
      console.error(`   Run 'npm run build:current' or 'pnpm build:current' to build the binary for your platform.`);
    } else {
      console.error(`❌ Failed to execute binary:`, err.message);
    }
    process.exit(1);
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
    } else {
      process.exit(code || 0);
    }
  });
}

// Run the binary
runBinary();

