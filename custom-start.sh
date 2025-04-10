#!/bin/bash

# Perform the build
echo "Building project..."
npm run build

# Copy files to server/public
echo "Ensuring static files are in the correct location..."
mkdir -p server/public
cp -r dist/public/* server/public/

# Start the server in production mode
echo "Starting server in production mode..."
NODE_ENV=production node dist/index.js