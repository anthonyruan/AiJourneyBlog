// server-utils.js
// This file contains utility functions for server deployment

import fs from 'fs';
import path from 'path';

// Check and copy production build files
export function ensureStaticFiles() {
  console.log('Checking for static files...');
  
  // Step 1: Ensure server/public directory exists
  const serverPublicDir = path.join(process.cwd(), 'server', 'public');
  
  if (!fs.existsSync(serverPublicDir)) {
    console.log('Creating server/public directory...');
    fs.mkdirSync(serverPublicDir, { recursive: true });
  }
  
  // Step 2: Check if we have a build in dist/public that we can copy
  const distPublicDir = path.join(process.cwd(), 'dist', 'public');
  
  if (fs.existsSync(distPublicDir)) {
    console.log('Found build files, copying to server/public...');
    
    // Copy files from dist/public to server/public
    copyDirectory(distPublicDir, serverPublicDir);
    
    return true;
  } else {
    console.log('No build files found in dist/public, skipping copy step');
    return false;
  }
}

// Helper function to recursively copy a directory
function copyDirectory(source, destination) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }
  
  // Get all files and directories in the source
  const items = fs.readdirSync(source);
  
  // Copy each item
  for (const item of items) {
    const sourcePath = path.join(source, item);
    const destPath = path.join(destination, item);
    
    if (fs.statSync(sourcePath).isDirectory()) {
      // Recursively copy subdirectories
      copyDirectory(sourcePath, destPath);
    } else {
      // Copy files
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}