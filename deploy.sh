#!/bin/bash

# Deployment script for AI Assistant Builder
# Fixes deployment issues: postgres dependency, esbuild bundling, port binding

echo "Starting deployment build..."

# Build frontend
echo "Building frontend..."
npm run build:frontend || { echo "Frontend build failed"; exit 1; }

# Build backend with proper dependency inclusion
echo "Building backend..."
npx esbuild server/index.ts \
  --platform=node \
  --bundle \
  --format=esm \
  --outdir=dist \
  --external:fs \
  --external:path \
  --external:os \
  --external:crypto \
  --external:http \
  --external:https \
  --external:url \
  --external:stream \
  --external:util \
  --external:events \
  --external:buffer \
  --external:querystring \
  --external:net \
  --external:tls \
  --external:child_process \
  --external:worker_threads \
  --external:cluster \
  --external:zlib \
  --minify \
  --sourcemap \
  || { echo "Backend build failed"; exit 1; }

echo "Build completed successfully!"
echo "Ready for deployment. Run: NODE_ENV=production node dist/index.js"