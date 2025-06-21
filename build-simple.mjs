#!/usr/bin/env node

import { build } from 'esbuild';
import { execSync } from 'child_process';

console.log('Building frontend...');
execSync('vite build', { stdio: 'inherit' });

console.log('Building backend with simplified configuration...');

try {
  await build({
    entryPoints: ['server/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outdir: 'dist',
    external: [
      // Only exclude Node.js built-in modules - bundle all npm packages
      'fs', 'path', 'os', 'crypto', 'http', 'https', 'url', 'stream', 
      'util', 'events', 'buffer', 'querystring', 'net', 'tls', 
      'child_process', 'worker_threads', 'cluster', 'zlib', 'dns',
      'readline', 'perf_hooks', 'v8', 'vm', 'assert', 'constants',
      'module', 'timers', 'dgram'
    ],
    define: {
      'process.env.NODE_ENV': '"production"'
    },
    minify: false, // Disable minification to avoid complex bundling issues
    sourcemap: true,
    logLevel: 'warning', // Reduce noise
    banner: {
      js: `
        import { createRequire } from 'module';
        import { fileURLToPath } from 'url';
        import { dirname } from 'path';
        const require = createRequire(import.meta.url);
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
      `
    },
    // Add resolve extensions to help with module resolution
    resolveExtensions: ['.ts', '.js', '.mjs', '.json'],
    // Ignore problematic requires that aren't needed at runtime
    inject: [],
    loader: {
      '.ts': 'ts',
      '.js': 'js'
    }
  });
  
  console.log('Build completed successfully!');
  console.log('The postgres package and other dependencies are now bundled.');
  
} catch (error) {
  console.error('Build failed:', error.message);
  // If build fails, try fallback approach
  console.log('Trying fallback build approach...');
  
  try {
    await build({
      entryPoints: ['server/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outdir: 'dist',
      packages: 'external', // Keep packages external but ensure they're in dependencies
      external: ['node:*'],
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      minify: false,
      sourcemap: true,
      logLevel: 'warning'
    });
    
    console.log('Fallback build completed - dependencies will be resolved at runtime');
  } catch (fallbackError) {
    console.error('Both build approaches failed:', fallbackError.message);
    process.exit(1);
  }
}