# Template Management System

A comprehensive React application for managing onboarding flows and questionnaires. Built with React, TypeScript, Firebase, and Tailwind CSS.

## Features

### Authentication System
- Secure email/password authentication
- Profile management with avatars
- Password change functionality
- Profile deletion option
- Session management
- Security-first design

### Template Management
- Create and manage templates
- Multi-select and bulk operations
- Advanced filtering and search
- Default template management
- Mobile-responsive interface

### Firebase Integration
- Real-time data synchronization
- Offline support
- Authentication system
- Security rules
- Performance monitoring

### Core Functionality
- Template CRUD operations
- Status management (draft/published/archived)
- Bulk actions (delete, status update)
- Search and advanced filtering
- Mobile-optimized views

### User Interface
- Clean, modern design
- Responsive layout
- Touch-friendly controls
- Intuitive navigation
- Real-time feedback

## Quick Start

```bash
# Install dependencies
npm install

# Set up Firebase configuration
cp .env.example .env
# Add your Firebase configuration to .env

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
├── components/        # Reusable UI components
├── hooks/            # Custom React hooks
├── pages/            # Main application views
├── lib/             # Core libraries
├── utils/           # Helper functions
└── types/           # TypeScript definitions
```

## Technology Stack

### Core
- React 18
- TypeScript 5
- Firebase 10
- Tailwind CSS 3
- Vite 5

### Firebase Services
- Firestore
- Authentication
- Performance Monitoring
- Security Rules

### State Management
- React hooks
- Context API
- Custom hooks
- Firebase real-time updates

### UI Components
- Tailwind CSS
- Lucide icons
- Custom components
- Responsive design

## Development

### Prerequisites
- Node.js 18+
- npm 8+
- Firebase project

### Firebase Setup
1. Create a Firebase project
2. Enable Firestore and Authentication
3. Copy configuration to .env
4. Set up security rules

### Available Scripts

```bash
# Development
npm run dev         # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build

# Testing
npm test           # Run tests
npm run test:ui    # Run tests with UI
npm run coverage   # Generate coverage report

# Firebase
npm run firebase:emulators  # Start Firebase emulators
npm run firebase:deploy    # Deploy to Firebase

# Code Quality
npm run lint       # Run ESLint
npm run type-check # Run TypeScript checks
npm run format     # Format code
```

### Testing
- Unit tests for components
- Integration tests for flows
- Firebase service tests
- Hook testing
- Utility function tests

### Debugging
- Firebase Debug View (`/debug`)
- Performance monitoring
- Error tracking
- Real-time data viewer

### Best Practices
- TypeScript for type safety
- Component composition
- Custom hooks for logic
- Responsive design
- Accessibility
- Error handling

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

## License

MIT License - See [LICENSE](LICENSE) for details