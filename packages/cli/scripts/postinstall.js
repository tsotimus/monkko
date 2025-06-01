#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

function getPlatformBinary() {
  const platform = os.platform();
  const arch = os.arch();
  
  // Map Node.js platform names to our binary names
  const platformMap = {
    'darwin': 'darwin',
    'linux': 'linux', 
    'win32': 'windows'
  };
  
  const platformName = platformMap[platform];
  if (!platformName) {
    throw new Error(`Unsupported platform: ${platform}`);
  }
  
  const extension = platform === 'win32' ? '.exe' : '';
  return `monko-${platformName}${extension}`;
}

function setupBinary() {
  const binDir = path.join(__dirname, '..', 'bin');
  const targetBinary = path.join(binDir, 'monko');
  const platformBinary = path.join(binDir, getPlatformBinary());
  
  // Check if platform-specific binary exists
  if (!fs.existsSync(platformBinary)) {
    console.error(`Binary not found for your platform: ${getPlatformBinary()}`);
    console.error('You may need to build from source or use a different installation method.');
    process.exit(1);
  }
  
  // Remove existing symlink/file if it exists
  if (fs.existsSync(targetBinary)) {
    fs.unlinkSync(targetBinary);
  }
  
  // Create symlink or copy file (Windows doesn't support symlinks easily)
  if (os.platform() === 'win32') {
    fs.copyFileSync(platformBinary, targetBinary);
  } else {
    fs.symlinkSync(path.basename(platformBinary), targetBinary);
    fs.chmodSync(targetBinary, '755');
  }
  
  console.log(`✅ monko ready for ${os.platform()}-${os.arch()}`);
}

// Only run if this script is executed directly (not required)
if (require.main === module) {
  try {
    setupBinary();
  } catch (error) {
    console.error('❌ Failed to setup monko-kit binary:', error.message);
    process.exit(1);
  }
} 