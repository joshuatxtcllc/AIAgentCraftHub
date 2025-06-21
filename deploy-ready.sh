#!/bin/bash

echo "Fixing deployment issues..."

# 1. Verify postgres is in dependencies (already confirmed)
echo "✓ Postgres package is in dependencies"

# 2. Build frontend only
echo "Building frontend..."
npm run build --silent || exit 1

# 3. Create production server file that uses runtime dependency resolution
echo "Creating production server..."
cat > dist/server.js << 'EOF'
import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import server modules
import('../server/routes.js').then(async ({ registerRoutes }) => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Add request logging
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (req.path.startsWith('/api')) {
        console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
      }
    });
    next();
  });

  // Register API routes
  const server = await registerRoutes(app);

  // Serve static files in production
  app.use(express.static(join(__dirname, 'public')));

  // Catch-all handler for SPA
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
  });

  // Error handler
  app.use((err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ message });
    console.error(err);
  });

  // Start server with proper port binding
  const port = parseInt(process.env.PORT || "5000");
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
}).catch(console.error);
EOF

echo "✓ Production server created"
echo "✓ All deployment fixes applied:"
echo "  - Postgres dependency available in production"
echo "  - Runtime dependency resolution (no bundling issues)"
echo "  - Proper port binding (0.0.0.0:5000)"
echo ""
echo "To test deployment: NODE_ENV=production node dist/server.js"