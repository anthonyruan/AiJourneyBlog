// Custom production startup script for deployment
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting application in production mode...');

// Make sure the server/public directory exists
if (!fs.existsSync(path.join(process.cwd(), 'server', 'public'))) {
  console.log('Creating server/public directory...');
  fs.mkdirSync(path.join(process.cwd(), 'server', 'public'), { recursive: true });
}

// Copy built files if they exist in dist/public
if (fs.existsSync(path.join(process.cwd(), 'dist', 'public'))) {
  console.log('Copying built files from dist/public to server/public...');
  
  // Read all files recursively from dist/public
  function copyFilesRecursively(sourceDir, targetDir) {
    const files = fs.readdirSync(sourceDir);
    
    files.forEach(file => {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);
      
      const stats = fs.statSync(sourcePath);
      
      if (stats.isDirectory()) {
        if (!fs.existsSync(targetPath)) {
          fs.mkdirSync(targetPath, { recursive: true });
        }
        copyFilesRecursively(sourcePath, targetPath);
      } else {
        fs.copyFileSync(sourcePath, targetPath);
      }
    });
  }
  
  copyFilesRecursively(
    path.join(process.cwd(), 'dist', 'public'),
    path.join(process.cwd(), 'server', 'public')
  );
}

// Set production environment variables
process.env.NODE_ENV = 'production';

// Start the server
console.log('Starting production server...');
const server = spawn('node', ['dist/index.js'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production' }
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});