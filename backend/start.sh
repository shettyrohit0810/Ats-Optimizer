#!/bin/bash

# Ensure the build directory exists
mkdir -p dist

# Run the build if dist/index.js doesn't exist
if [ ! -f "dist/index.js" ]; then
    echo "Building TypeScript..."
    npm run build
fi

# Start the server
node dist/index.js
