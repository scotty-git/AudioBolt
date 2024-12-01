# Template Management System

A client-side React application for managing onboarding flows and questionnaires. Built with React, TypeScript, and IndexedDB for local storage.

## Current Features

### Template Management
- Create and manage onboarding flows and questionnaires
- Draft, publish, and archive templates
- Version tracking
- Default template support
- JSON-based template structure

### Client-Side Storage
- IndexedDB for persistent browser storage
- Structured data schema
- Repository pattern implementation
- Offline-first architecture

### Core Functionality
- Template CRUD operations
- Response tracking
- Builder interface for template creation
- User interface for completing questionnaires
- Status management (draft/published/archived)

### User Interface
- React-based modern UI
- Tailwind CSS styling
- Responsive design
- Error boundary protection
- Debug interface

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

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

## Technology Stack

### Core
- React 18
- TypeScript
- Vite
- IndexedDB (via idb package)
- Tailwind CSS

### State Management
- React hooks
- Context API
- IndexedDB for persistence

### Data Validation
- Zod schemas
- TypeScript types
- Repository pattern

### Testing
- Vitest
- React Testing Library
- Happy DOM
- Fake IndexedDB for testing

## Development

### Prerequisites
- Node.js
- npm

### Available Scripts

```bash
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

### Testing
- Unit tests for components
- Integration tests
- Repository tests
- Hook testing
- Schema validation tests

### Best Practices
- TypeScript for type safety
- Component composition
- Custom hooks for logic
- Responsive design
- Error boundaries
- Schema validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Follow existing code style
- Use meaningful commit messages