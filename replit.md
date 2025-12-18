# Sistema de Cadastro de Extras

## Overview
This is a comprehensive expense management system (Sistema de Cadastro de Extras) built with React, Vite, and Supabase. The application provides role-based access control for managing employees, companies, receipts, and reports.

**Purpose:** Manage extras/expenses with multi-level authorization and reporting capabilities.

**Tech Stack:**
- Frontend: React 18.2 + Vite 4.4
- UI Components: Radix UI + Tailwind CSS
- Backend/Database: Supabase
- Routing: React Router v6
- Forms & Data: HTML2Canvas, jsPDF, XLSX for reports/exports

**Current State:** Successfully configured for Replit environment and running on port 5000.

## Project Architecture

### Directory Structure
```
/
├── src/
│   ├── components/        # React components
│   │   ├── Companies/     # Company management
│   │   ├── Employees/     # Employee management
│   │   ├── Profile/       # User profile
│   │   ├── Receipts/      # Receipt handling
│   │   ├── Reports/       # Reporting components
│   │   ├── Users/         # User management
│   │   └── ui/            # Reusable UI components (Radix UI based)
│   ├── contexts/          # React contexts (Auth)
│   ├── helpers/           # Utility functions (PDF, receipt actions)
│   ├── lib/               # Supabase client and utilities
│   ├── pages/             # Route pages
│   └── App.jsx            # Main application component
├── plugins/               # Vite plugins for visual editor
├── tools/                 # Build tools
└── index.html             # Entry HTML
```

### User Roles
The system supports three roles with different access levels:
- **lançador** (launcher): Create/edit extras, view authorized companies, view own extras
- **gestor** (manager): View reports, manage companies, manage employees
- **admin**: Full system access including user management

### Key Features
1. Authentication with Supabase (login, signup, password reset)
2. Role-based route protection
3. Employee management
4. Company management
5. Receipt/expense tracking
6. Reporting with filters and statistics
7. PDF export capabilities
8. Excel export (XLSX)

## Configuration

### Development Server
- **Port:** 5000
- **Host:** 0.0.0.0 (configured for Replit environment)
- **Command:** `npm run dev`

### Vite Configuration
- Configured with `allowedHosts: true` for Replit proxy compatibility
- CORS enabled for development
- Custom plugins for visual editing mode (development only)
- Path alias: `@` maps to `./src`

### PostgreSQL Integration
The app connects to an external PostgreSQL database:
- Connection URL: Stored in `EXTERNAL_DATABASE_URL` secret
- Backend API queries database directly from Express.js server (port 3001)
- Tables created automatically on server start: users, companies, employees, extras
- Data properly persisted in VPS PostgreSQL instance

### Build Configuration
- Build command: `npm run build`
- Deployment: Static site deployment (outputs to `dist/` directory)
- Pre-build: Runs `tools/generate-llms.js` to generate LLM context

## Deployment
Configured for autoscale deployment on Replit:
- **Deployment Type:** Autoscale (runs only when receiving requests)
- **Build Command:** `npm run build` (creates production build in `dist/` folder)
- **Run Command:** `node server.js` (runs backend API + serves static files)
- **Server Port:** 5000 (automatically exposed to internet)
- **API Port:** 3001 (internal, accessed by server.js)
- **Frontend:** Served as static files from the `dist/` directory by Express server
- **Backend API:** All endpoints available at `/api/*` routes

## Recent Changes
**December 18, 2025** - Fixed Receipt Generation on Approval:
- Fixed receiptActions.js to use dynamic API URL based on environment
- Development uses http://localhost:3001/api, production uses /api
- Approval button now correctly generates PDF and saves to PostgreSQL
- Download button retrieves saved PDF from database
- Enhanced logging for debugging receipt generation
- All receipt actions (approve, reject, acknowledge) working correctly

**December 16, 2025** - Fixed Receipt Download System:
- Migrated receiptActions.js from Supabase to PostgreSQL
- Added receipt endpoints to server.js (/api/recibos)
- Automatic table creation on server startup for recibos
- PDF generation and storage working with PostgreSQL
- Status updates for extras (approved, rejected, acknowledged)
- Receipts now download without "not found" errors after approval
- Both development and production fully aligned

**December 16, 2025** - Fixed Development Environment (Final):
- Fixed ReplitAuthContext.jsx to use hostname-based API URL detection (matching replitDbClient.js)
- Development now correctly routes to http://localhost:3001/api (same PostgreSQL database)
- Both development and production environments use identical EXTERNAL_DATABASE_URL secret
- Removed import.meta.env.DEV dependency which was causing environment detection issues
- Added logging to track API URL usage in authentication
- Development login error "Falha de rede" now resolved
- Both versions fully synchronized with same PostgreSQL backend

**December 16, 2025** - Complete System Stabilization:
- Fixed Dashboard.jsx to use replitDb API instead of Supabase (now uses PostgreSQL)
- Fixed user role/name properties in Dashboard (user.role and user.name instead of metadata)
- Fixed API URL routing: localhost:3001/api in dev, /api in production
- Updated server.js to serve static files from dist/ and handle SPA routing
- Changed deployment to autoscale with Express backend serving both frontend + API
- Added enhanced error logging in authentication and API calls for better debugging
- All CRUD operations working with PostgreSQL in both development and production
- Admin user verified: leticia.silva.l1998@gmail.com / Bombom@8100
- Application fully tested and operational in both environments

**December 16, 2025** - PostgreSQL Migration:
- Migrated from Replit Database to external PostgreSQL (VPS hosted)
- All tables created in PostgreSQL: users, companies, employees, extras
- Data successfully migrated from Replit Database to PostgreSQL
- Backend API updated to use pg library for direct database queries
- Connection string stored securely as EXTERNAL_DATABASE_URL secret

**December 12, 2025** - Database Migration & Bug Fixes:
- Migrated from Supabase to Replit Database with custom Express.js backend API
- Fixed role verification in App.jsx to support `user.role` property
- Backend server runs on port 3001, frontend on port 5000

**December 4, 2025** - Initial Replit Setup:
- Changed dev server port from 3000 to 5000
- Updated host from `::` to `0.0.0.0` for Replit compatibility
- Created `.gitignore` with Node.js patterns
- Configured workflow for development server
- Set up static deployment configuration
- Installed all npm dependencies

## Development Workflow

### Running the Application
The application starts automatically via the configured workflow. To manually restart:
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Dependencies
All dependencies are managed via npm and listed in `package.json`. Key dependencies include:
- React ecosystem (react, react-dom, react-router-dom)
- Supabase client
- Radix UI components
- Tailwind CSS for styling
- Framer Motion for animations
- PDF/Excel export libraries

## Migration Summary

### From Supabase → Replit Database → PostgreSQL
The application has undergone two major database migrations:

1. **Initial**: Built with Supabase backend
2. **December 12**: Migrated to Replit Database for simplicity
3. **December 16**: Migrated to external PostgreSQL (VPS) for persistence and scalability

### Why PostgreSQL?
- Data persists across Replit restarts
- Better performance for production workloads
- More control over database configuration
- Easier integration with external monitoring and backups

### Login Credentials (Test Account)
- **Email:** leticia.silva.l1998@gmail.com
- **Password:** Bombom@8100
- **Role:** admin (full system access)

## Notes
- The application uses Portuguese language in the UI
- Visual editor plugins are only enabled in development mode
- PostgreSQL database is hosted on external VPS and accessed via EXTERNAL_DATABASE_URL secret
- All routes (except auth pages) require authentication
- All CRUD operations use native PostgreSQL queries for maximum performance
