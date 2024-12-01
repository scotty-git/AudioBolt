# Project Overview

## Introduction
A client-side React application for managing onboarding flows and questionnaires. The application provides a flexible system for creating, managing, and completing both onboarding processes and questionnaires with a focus on user experience and data integrity.

## Goals
1. Provide an intuitive interface for template creation and management
2. Enable flexible questionnaire and onboarding flow design
3. Support offline-first operations
4. Maintain data integrity and version control
5. Ensure scalability for future remote database integration

## Current Scope
- Template management system (onboarding flows and questionnaires)
- Client-side data persistence
- Builder interface for template creation
- User interface for completing questionnaires
- Version tracking and template status management

## Technology Stack

### Core Technologies
- React 18 - UI framework
- TypeScript - Type safety and developer experience
- Vite - Build tool and development server
- IndexedDB (via idb package) - Client-side storage
- Tailwind CSS - Styling and UI components

### Development Tools
- ESLint - Code linting
- Prettier - Code formatting
- Vitest - Testing framework
- React Testing Library - Component testing
- Happy DOM - Testing environment
- Fake IndexedDB - Database testing

## Project Structure
```
src/
├── components/     # Reusable UI components
├── db/            # IndexedDB setup and repositories
├── hooks/         # Custom React hooks
├── pages/         # Main application views
├── schemas/       # Zod validation schemas
├── types/         # TypeScript definitions
└── utils/         # Helper functions
```

## Development Environment

### Prerequisites
- Node.js
- npm

### Setup Commands
```bash
# Installation
npm install

# Development
npm run dev         # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build

# Testing
npm test           # Run tests
npm run test:watch # Watch mode
npm run test:ui    # Test with UI
npm run test:coverage # Generate coverage

# Code Quality
npm run lint       # Run ESLint
npm run type-check # Run TypeScript checks
npm run format     # Format code

# Database
npm run db:setup   # Set up IndexedDB
npm run cleanup    # Clean database
```

## Future Roadmap
1. Remote database integration
2. User authentication system
3. Real-time updates and collaboration
4. Enhanced offline capabilities
5. Data synchronization
6. Backup and recovery systems

## Contributing
The project follows standard open-source contribution practices with a focus on code quality and testing. All new features and changes must include appropriate tests and documentation.
``` 