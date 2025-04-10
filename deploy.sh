#!/bin/bash

# Build the application
npm run build

# Create server/public directory if it doesn't exist
mkdir -p server/public

# Copy the built files to server/public
cp -r dist/public/* server/public/

echo "Deployment preparation complete!"