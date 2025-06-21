# AI Assistant Builder Platform

## Project Overview
A powerful AI assistant builder platform that enables users to create complex, intelligent workflows through an intuitive drag-and-drop interface.

**Stack:**
- React-based frontend with TypeScript
- Express backend with Node.js
- PostgreSQL database with Drizzle ORM
- Advanced drag-and-drop workflow builder
- Configurable workflow nodes supporting triggers, AI actions, conditions, and outputs

## Recent Changes (June 21, 2025)

### ✓ Fixed Critical Deployment Issues
- **Dependency Resolution**: Confirmed `postgres` package is correctly in dependencies (not devDependencies)
- **Runtime Dependencies**: Created `quick-deploy-fix.js` that generates production-ready server using runtime dependency resolution instead of complex bundling
- **Server Port Binding**: Production server properly binds to `0.0.0.0` with `PORT` environment variable for deployment compatibility
- **Build System**: Implemented fallback approach using `tsx` for TypeScript execution in production, avoiding esbuild bundling issues
- **Error Handling**: Added comprehensive error handling and logging for production deployment

### ✓ Application Status
- Server successfully running on port 5000
- Frontend compiling without errors
- Database connection working
- All core components functional

## Project Architecture

### Frontend Structure
- `/client/src/components/` - Reusable UI components
- `/client/src/pages/` - Application pages
- `/client/src/store/` - Zustand state management
- `/shared/schema.ts` - Shared TypeScript types and Drizzle schemas

### Backend Structure
- `/server/index.ts` - Main server entry point
- `/server/routes.ts` - API route handlers
- `/server/storage.ts` - Database abstraction layer
- `/server/workflow-engine.ts` - Workflow execution engine
- `/server/ai-service.ts` - OpenAI integration

### Key Features Implemented
- Assistant configuration and management
- Drag-and-drop workflow builder
- Real-time chat interface
- Template library
- Activity feed
- Integration guides
- Multi-step wizard interface

## Deployment Configuration

### Build Process
The project includes custom build scripts to handle deployment issues:

1. **Frontend Build**: Standard Vite build process
2. **Backend Build**: Custom esbuild configuration that:
   - Bundles all npm dependencies (postgres, express, etc.)
   - Excludes only Node.js built-in modules
   - Minifies and creates sourcemaps
   - Sets production environment variables

### Port Configuration
- Development: Port 5000 (both frontend and backend)
- Production: Uses `process.env.PORT` with fallback to 5000
- Server binds to `0.0.0.0` for external access

## User Preferences
*None specified yet*

## Technical Decisions

### Database Strategy
- Uses PostgreSQL with Drizzle ORM
- Fallback storage system: Database → Memory → Mock data
- Schema defined in `/shared/schema.ts`

### State Management
- Zustand for client-side state
- React Query for server state and caching
- Context providers for user authentication

### Styling
- Tailwind CSS with shadcn/ui components
- Responsive design with mobile navigation
- Consistent theming throughout application