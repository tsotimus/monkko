import fs from 'fs';
import path from 'path';
import glob from 'fast-glob';

const packageJsonPath = 'package.json';
const srcPath = 'src';

// Read current package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Find all index.ts files in subdirectories
const subpathIndexFiles = glob.sync(`${srcPath}/*/index.ts`);

// Generate exports object
const exports = {
  ".": {
    "import": "./dist/index/index.js",
    "types": "./dist/index.d.ts"
  }
};

// Add exports for each subdirectory
subpathIndexFiles.forEach(file => {
  const relativePath = path.relative(srcPath, file);
  const dirName = path.dirname(relativePath);
  
  exports[`./${dirName}`] = {
    "import": `./dist/${dirName}/index.js`,
    "types": `./dist/${dirName}/index.d.ts`
  };
});

// Update package.json
packageJson.exports = exports;

// Write back to package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log('✅ Generated exports for:', Object.keys(exports).filter(key => key !== '.').map(key => key.slice(2))); 