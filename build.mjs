#!/usr/bin/env node

import { build } from 'esbuild';
import { execSync } from 'child_process';

console.log('Building frontend...');
execSync('vite build', { stdio: 'inherit' });

console.log('Building backend...');

// Create a plugin to handle problematic dependencies
const ignorePlugin = {
  name: 'ignore-problematic-deps',
  setup(build) {
    // Mark problematic imports as external to avoid bundling issues
    build.onResolve({ filter: /@babel\/preset-typescript\/package\.json$/ }, () => ({
      path: '@babel/preset-typescript/package.json',
      external: true
    }));
    
    build.onResolve({ filter: /\.\.\/pkg$/ }, () => ({
      path: '../pkg',
      external: true
    }));
  }
};

try {
  await build({
    entryPoints: ['server/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outdir: 'dist',
    plugins: [ignorePlugin],
    external: [
      // Node.js built-in modules
      'fs', 'path', 'os', 'crypto', 'http', 'https', 'url', 'stream', 
      'util', 'events', 'buffer', 'querystring', 'net', 'tls', 
      'child_process', 'worker_threads', 'cluster', 'zlib', 'dns',
      'readline', 'perf_hooks', 'v8', 'vm', 'assert', 'constants',
      'module', 'timers', 'dgram'
    ],
    define: {
      'process.env.NODE_ENV': '"production"'
    },
    minify: true,
    sourcemap: true,
    logLevel: 'info',
    banner: {
      js: `
        import { createRequire } from 'module';
        import { fileURLToPath } from 'url';
        import { dirname } from 'path';
        const require = createRequire(import.meta.url);
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
      `
    }
  });
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}

console.log('Build completed successfully!');