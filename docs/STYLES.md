# Styling Guide

## Core Technologies
- Tailwind CSS 3.4
- CSS Variables
- CSS-in-JS utilities
- PostCSS with Autoprefixer

## Design System

### Colors
```css
/* Brand Colors */
--primary: #2563eb;     /* Blue 600 */
--primary-dark: #1d4ed8; /* Blue 700 */
--primary-light: #eff6ff; /* Blue 50 */

/* Neutral Colors */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;

/* Semantic Colors */
--success: #10B981;
--error: #EF4444;
--warning: #F59E0B;
--info: #3B82F6;

/* Auth States */
--auth-success: #059669;  /* Green 600 */
--auth-error: #DC2626;    /* Red 600 */
--auth-warning: #D97706;  /* Yellow 600 */
--auth-info: #2563EB;     /* Blue 600 */
```

### Typography
```css
/* Font Stack */
--font-sans: Inter, system-ui, -apple-system, sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;   /* 12px */
--text-sm: 0.875rem;  /* 14px */
--text-base: 1rem;    /* 16px */
--text-lg: 1.125rem;  /* 18px */
--text-xl: 1.25rem;   /* 20px */
--text-2xl: 1.5rem;   /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem;  /* 36px */
```

### Spacing
```css
/* Base spacing unit: 4px */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

## Component Patterns

### Authentication Components

#### Login Form
```jsx
// Login Form Container
<div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-md">
  <h2 className="text-2xl font-bold text-gray-900 mb-6">
    Login to AudioBolt
  </h2>
  
  {/* Email Input */}
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Email
    </label>
    <input
      type="email"
      className="w-full p-2 border border-gray-300 rounded-md
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                placeholder-gray-400 transition-colors"
      placeholder="you@example.com"
    />
  </div>

  {/* Password Input */}
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Password
    </label>
    <input
      type="password"
      className="w-full p-2 border border-gray-300 rounded-md
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                placeholder-gray-400 transition-colors"
      placeholder="••••••••"
    />
  </div>

  {/* Submit Button */}
  <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md
                    hover:bg-blue-700 focus:ring-2 focus:ring-blue-500
                    focus:ring-offset-2 transition-colors">
    Sign In
  </button>
</div>
```

#### Profile Management
```jsx
// Profile Avatar
<div className="relative">
  <img
    src={avatarUrl}
    alt="Profile"
    className="w-24 h-24 rounded-full object-cover border-4 border-white
               shadow-lg"
  />
  <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full
                    shadow-md hover:bg-gray-50 transition-colors">
    <PencilIcon className="w-4 h-4 text-gray-600" />
  </button>
</div>

// Profile Form
<form className="space-y-6 max-w-lg">
  {/* Name Input */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Display Name
    </label>
    <input
      type="text"
      className="w-full p-2 border border-gray-300 rounded-md
                focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>

  {/* Email Input */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Email
    </label>
    <input
      type="email"
      className="w-full p-2 border border-gray-300 rounded-md
                focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>

  {/* Save Button */}
  <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md
                    hover:bg-blue-700 focus:ring-2 focus:ring-blue-500
                    focus:ring-offset-2 transition-colors">
    Save Changes
  </button>
</form>
```

### Common Components

#### Buttons
```jsx
// Primary Button
<button className="px-4 py-2 bg-blue-600 text-white rounded-md
                  hover:bg-blue-700 focus:ring-2 focus:ring-blue-500
                  focus:ring-offset-2 transition-colors">
  Primary Action
</button>

// Secondary Button
<button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md
                  hover:bg-gray-200 focus:ring-2 focus:ring-gray-500
                  focus:ring-offset-2 transition-colors">
  Secondary Action
</button>

// Danger Button
<button className="px-4 py-2 bg-red-600 text-white rounded-md
                  hover:bg-red-700 focus:ring-2 focus:ring-red-500
                  focus:ring-offset-2 transition-colors">
  Danger Action
</button>
```

#### Form Elements
```jsx
// Text Input
<input
  className="w-full p-2 border border-gray-300 rounded-md
             focus:ring-2 focus:ring-blue-500 focus:border-transparent
             placeholder-gray-400 transition-colors"
/>

// Select Input
<select
  className="w-full p-2 border border-gray-300 rounded-md
             focus:ring-2 focus:ring-blue-500 focus:border-transparent
             bg-white"
>
  <option>Option 1</option>
  <option>Option 2</option>
</select>

// Checkbox
<label className="flex items-center space-x-2">
  <input
    type="checkbox"
    className="w-4 h-4 text-blue-600 border-gray-300 rounded
               focus:ring-blue-500"
  />
  <span className="text-sm text-gray-700">Remember me</span>
</label>
```

### Feedback Components

#### Loading States
```jsx
// Button Loading
<button className="px-4 py-2 bg-blue-600 text-white rounded-md
                  flex items-center space-x-2 opacity-75 cursor-not-allowed">
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
    {/* Spinner SVG */}
  </svg>
  <span>Loading...</span>
</button>

// Loading Overlay
<div className="fixed inset-0 bg-gray-900 bg-opacity-50
                flex items-center justify-center">
  <div className="bg-white p-4 rounded-lg shadow-xl">
    <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
      {/* Spinner SVG */}
    </svg>
  </div>
</div>
```

#### Error States
```jsx
// Error Message
<div className="p-4 bg-red-50 border border-red-200 rounded-md">
  <div className="flex">
    <ExclamationIcon className="h-5 w-5 text-red-400" />
    <div className="ml-3">
      <h3 className="text-sm font-medium text-red-800">
        Error Message Title
      </h3>
      <div className="mt-2 text-sm text-red-700">
        Detailed error message goes here
      </div>
    </div>
  </div>
</div>

// Input Error
<div>
  <input
    className="w-full p-2 border border-red-300 rounded-md
               focus:ring-2 focus:ring-red-500 focus:border-transparent
               text-red-900 placeholder-red-300"
    placeholder="Invalid input"
  />
  <p className="mt-1 text-sm text-red-600">Error message goes here</p>
</div>
```

#### Success States
```jsx
// Success Message
<div className="p-4 bg-green-50 border border-green-200 rounded-md">
  <div className="flex">
    <CheckCircleIcon className="h-5 w-5 text-green-400" />
    <div className="ml-3">
      <h3 className="text-sm font-medium text-green-800">
        Success Message Title
      </h3>
      <div className="mt-2 text-sm text-green-700">
        Operation completed successfully
      </div>
    </div>
  </div>
</div>
```

### Layout Components

#### Card Layouts
```jsx
// Profile Card
<div className="bg-white rounded-lg shadow-md overflow-hidden">
  <div className="p-6">
    <div className="flex items-center space-x-4">
      <img
        src={avatarUrl}
        alt="Profile"
        className="w-12 h-12 rounded-full"
      />
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          User Name
        </h3>
        <p className="text-sm text-gray-500">
          user@example.com
        </p>
      </div>
    </div>
  </div>
  <div className="px-6 py-4 bg-gray-50 border-t">
    <button className="text-sm text-blue-600 hover:text-blue-700">
      Edit Profile
    </button>
  </div>
</div>
```

### Responsive Design

#### Mobile-First Approach
```jsx
// Responsive Container
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>

// Responsive Grid
<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
  {/* Grid Items */}
</div>

// Responsive Typography
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
  Heading
</h1>

// Responsive Spacing
<div className="p-4 sm:p-6 lg:p-8">
  {/* Content with responsive padding */}
</div>
```

### Animation

#### Transitions
```css
/* Default Transitions */
.transition-default {
  @apply transition-all duration-200 ease-in-out;
}

/* Smooth Hover Effects */
.hover-lift {
  @apply transform transition-transform hover:-translate-y-1;
}

/* Loading Animations */
.spin {
  @apply animate-spin;
}

/* Fade Effects */
.fade-in {
  @apply opacity-0 animate-[fadeIn_200ms_ease-in-out_forwards];
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

## Best Practices

### Accessibility
- Use semantic HTML elements
- Include proper ARIA labels
- Maintain sufficient color contrast
- Support keyboard navigation
- Provide focus indicators

### Performance
- Minimize CSS bundle size
- Use CSS purging in production
- Optimize critical CSS
- Implement responsive images
- Lazy load components

### Maintainability
- Follow BEM naming convention
- Use CSS custom properties
- Implement consistent spacing
- Document complex components
- Create reusable utilities