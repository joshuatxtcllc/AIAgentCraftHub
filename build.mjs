#!/usr/bin/env node

import { build } from 'esbuild';
import { execSync } from 'child_process';

console.log('Building frontend...');
execSync('vite build', { stdio: 'inherit' });

console.log('Building backend...');
try {
  await build({
    entryPoints: ['server/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outdir: 'dist',
    external: [
      // Node.js built-in modules
      'node:*',
      'fs', 'path', 'os', 'crypto', 'http', 'https', 'url', 'stream', 
      'util', 'events', 'buffer', 'querystring', 'net', 'tls', 
      'child_process', 'worker_threads', 'cluster', 'zlib', 'dns',
      'readline', 'perf_hooks', 'v8', 'vm', 'assert', 'constants',
      // Exclude problematic build-time dependencies
      '@babel/preset-typescript*',
      'lightningcss*',
      '../pkg',
      '@tailwindcss/vite'
    ],
    define: {
      'process.env.NODE_ENV': '"production"'
    },
    minify: false, // Disable minification to avoid issues
    sourcemap: true,
    logLevel: 'info',
    // Handle problematic requires
    banner: {
      js: `
        import { createRequire } from 'module';
        const require = createRequire(import.meta.url);
        const __filename = new URL(import.meta.url).pathname;
        const __dirname = new URL('.', import.meta.url).pathname;
      `
    }
  });
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}

console.log('Build completed successfully!');