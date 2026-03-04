# AGL Shared Workspace

Multi-project workspace for AGL template with shared components.

## Structure

```
Nissen-Partners_AGL/
├── shared/                    # Shared resources
│   ├── _layouts/             # Layout templates
│   ├── _partials/           # Reusable components
│   ├── _scss/               # SCSS framework
│   ├── _public/             # Shared assets
│   ├── plugins/             # Vite plugins
│   ├── vite.config.js       # Shared Vite config
│   └── package.json         # Shared dependencies
├── projects/                # Individual projects
│   ├── ibatabeENG/         # Project 1
│   └── kantogiken/         # Project 2
└── scripts/                # Utility scripts
    └── create-project.js   # Project generator
```

## Quick Start

### Development

```bash
# Start ibatabeENG project
npm run dev:ibatabeENG

# Start kantogiken project  
npm run dev:kantogiken
```

### Build

```bash
# Build individual projects
npm run build:ibatabeENG
npm run build:kantogiken

# Build all projects
npm run build:all
```

### Preview

```bash
# Preview individual projects
npm run preview:ibatabeENG
npm run preview:kantogiken
```

## Create New Project

```bash
# Create new project
npm run create-project -- new-project-name

# Then start development
npm run dev:new-project-name
```

## Project Structure

Each project contains only:
- `src/_data/data.json` - Project-specific data
- `src/_public/assets/img/` - Project images  
- `src/*.html` - HTML pages

All other resources (SCSS, JS, layouts, components) are shared.

## Available Scripts

- `dev:[project]` - Start development server
- `build:[project]` - Build for production
- `preview:[project]` - Preview production build
- `external:[project]` - Build with external URL
- `build:all` - Build all projects
- `lint` - Run all linters
- `lint:fix` - Fix linting issues
- `create-project` - Create new project

## Environment Variables

- `VITE_PROJECT` - Current project name
- `VITE_BASE_URL` - Base URL for deployment
