// Production startup script
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== STARTING PRODUCTION DEPLOYMENT ===');

// Step 1: Build the application
console.log('Building application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Build completed successfully.');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}

// Step 2: Ensure server/public directory exists
console.log('Setting up static files...');
const serverPublicDir = path.join(process.cwd(), 'server', 'public');
if (!fs.existsSync(serverPublicDir)) {
  fs.mkdirSync(serverPublicDir, { recursive: true });
}

// Step 3: Copy static files from dist/public to server/public
const distPublicDir = path.join(process.cwd(), 'dist', 'public');
if (fs.existsSync(distPublicDir)) {
  console.log('Copying static files to server/public...');
  
  try {
    // Delete all files in server/public first
    if (fs.existsSync(serverPublicDir)) {
      fs.readdirSync(serverPublicDir).forEach(file => {
        const filePath = path.join(serverPublicDir, file);
        if (fs.lstatSync(filePath).isDirectory()) {
          fs.rmSync(filePath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(filePath);
        }
      });
    }
    
    // Copy command depends on the OS
    if (process.platform === 'win32') {
      execSync(`xcopy /E /I /Y "${distPublicDir}" "${serverPublicDir}"`, { stdio: 'inherit' });
    } else {
      execSync(`cp -R ${distPublicDir}/* ${serverPublicDir}/`, { stdio: 'inherit' });
    }
    
    console.log('Static files copied successfully.');
  } catch (error) {
    console.error('Error copying static files:', error);
    process.exit(1);
  }
} else {
  console.error('Error: dist/public directory does not exist. Build may have failed.');
  process.exit(1);
}

// Step 4: Start the server in production mode
console.log('Starting server in production mode...');
try {
  process.env.NODE_ENV = 'production';
  execSync('node dist/index.js', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
} catch (error) {
  console.error('Server failed to start:', error);
  process.exit(1);
}