#!/usr/bin/env node

const { execSync } = require('child_process');
const os = require('os');

function buildForCurrentPlatform() {
  const platform = os.platform();
  const arch = os.arch();
  
  console.log(`🔧 Building for ${platform}-${arch}...`);
  
  // Map Node.js platform names to Go targets
  const platformMap = {
    'darwin': 'darwin',
    'linux': 'linux', 
    'win32': 'windows'
  };
  
  const goPlatform = platformMap[platform];
  if (!goPlatform) {
    throw new Error(`Unsupported platform: ${platform}`);
  }
  
  const extension = platform === 'win32' ? '.exe' : '';
  const binaryName = `monkko-${goPlatform}${extension}`;
  
  // Ensure bin directory exists
  execSync('mkdir -p bin', { stdio: 'inherit' });
  
  // Build the binary
  const env = {
    ...process.env,
    GOOS: goPlatform,
    GOARCH: arch === 'arm64' ? 'arm64' : 'amd64'
  };
  
  execSync(`go build -o bin/${binaryName} ./cmd/`, { 
    stdio: 'inherit',
    env: env
  });
  
  console.log(`✅ Built bin/${binaryName}`);
}

// Only run if this script is executed directly
if (require.main === module) {
  try {
    buildForCurrentPlatform();
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
} 