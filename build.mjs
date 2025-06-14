#!/usr/bin/env node

import { build } from 'esbuild';
import { execSync } from 'child_process';

console.log('Building frontend...');
execSync('vite build', { stdio: 'inherit' });

console.log('Building backend...');
await build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outdir: 'dist',
  external: [
    // Keep only Node.js built-in modules external
    'fs', 'path', 'os', 'crypto', 'http', 'https', 'url', 'stream', 
    'util', 'events', 'buffer', 'querystring', 'net', 'tls', 
    'child_process', 'worker_threads', 'cluster', 'zlib'
  ],
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  minify: true,
  sourcemap: true,
  logLevel: 'info'
});

console.log('Build completed successfully!');