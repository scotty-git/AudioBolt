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

### Buttons
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

### Form Elements
```jsx
// Text Input
<input
  className="w-full p-2 border border-gray-300 rounded-md
             focus:ring-2 focus:ring-blue-500 focus:border-transparent
             placeholder-gray-400 transition-colors"
/>

// Select
<select
  className="w-full p-2 border border-gray-300 rounded-md
             focus:ring-2 focus:ring-blue-500 focus:border-transparent
             bg-white transition-colors"
/>

// Checkbox
<input
  type="checkbox"
  className="w-4 h-4 text-blue-600 border-gray-300 rounded
             focus:ring-blue-500 transition-colors"
/>
```

### Cards
```jsx
// Basic Card
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  Content
</div>

// Interactive Card
<div className="bg-white rounded-lg shadow-sm border border-gray-200
                hover:border-blue-500 transition-colors cursor-pointer">
  Content
</div>
```

## Animations
```css
/* Fade In */
.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* Spin */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

## Responsive Design
```jsx
// Breakpoints
sm: '640px'   // Small devices
md: '768px'   // Medium devices
lg: '1024px'  // Large devices
xl: '1280px'  // Extra large devices
2xl: '1536px' // 2X Extra large devices

// Example Usage
<div className="
  p-4           /* Base padding */
  sm:p-6        /* Larger padding on small screens */
  md:p-8        /* Even larger on medium screens */
  lg:max-w-5xl  /* Max width on large screens */
  mx-auto       /* Center horizontally */
">
```

## Accessibility

### Focus States
```css
*:focus-visible {
  outline: none;
  @apply ring-2 ring-blue-500 ring-offset-2;
}
```

### Screen Reader Support
```jsx
// Hidden Labels
<label className="sr-only">Screen reader text</label>

// ARIA Labels
<button aria-label="Close modal">
  <Icon />
</button>
```

### Color Contrast
- All text colors meet WCAG 2.1 AA standards
- Interactive elements have distinct hover/focus states
- Error states use accessible red colors

## Best Practices

1. **Consistent Spacing**
   - Use standard spacing scale
   - Maintain consistent padding/margins
   - Use gap utilities for flexbox/grid

2. **Color Usage**
   - Use semantic color names
   - Maintain consistent color usage
   - Ensure sufficient contrast

3. **Typography**
   - Use type scale consistently
   - Maintain readable line lengths
   - Ensure proper hierarchy

4. **Component Structure**
   - Use semantic HTML
   - Maintain consistent class ordering
   - Group related styles

5. **Performance**
   - Use Tailwind's JIT compiler
   - Purge unused styles
   - Minimize custom CSS