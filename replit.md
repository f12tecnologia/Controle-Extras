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

### Supabase Integration
The app connects to a Supabase backend:
- URL: `https://baiamtipehjpssonxzjh.supabase.co`
- Authentication context provided via `SupabaseAuthContext`
- Client initialized in `src/lib/customSupabaseClient.js`

### Build Configuration
- Build command: `npm run build`
- Deployment: Static site deployment (outputs to `dist/` directory)
- Pre-build: Runs `tools/generate-llms.js` to generate LLM context

## Deployment
Configured for static site deployment on Replit:
- Build output directory: `dist/`
- Run `npm run build` to create production build
- Static files are served from the `dist` directory

## Recent Changes
**December 12, 2025** - Database Migration & Bug Fixes:
- Migrated from Supabase to Replit Database with custom Express.js backend API
- Fixed `extractValue()` function to handle Replit Database's `{ok: true, value: {...}}` response format
- Created admin user: `leticia.silva.l1998@gmail.com` / `Bombom@8100`
- Fixed role verification in App.jsx to support `user.role` property
- Backend server runs on port 3001, frontend on port 5000
- All CRUD endpoints (users, companies, employees, extras) properly handle data extraction

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

## Notes
- The application uses Portuguese language in the UI
- Visual editor plugins are only enabled in development mode
- The app requires Supabase credentials to function properly
- All routes (except auth pages) require authentication
