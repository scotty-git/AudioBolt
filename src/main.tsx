// CRITICAL STARTUP LOGGING
console.error(' MAIN.TSX: Script is being parsed CRITICAL');

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeDatabase } from './db/client';

// Global error handlers
window.addEventListener('error', (event) => {
  console.error(' GLOBAL ERROR CRITICAL:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error(' UNHANDLED PROMISE REJECTION CRITICAL:', {
    reason: event.reason,
    promise: event.promise
  });
});

// Extremely verbose logging function
const criticalLog = (message: string, data?: any) => {
  console.error(' CRITICAL LOG: ${message}', data || '');
};

const init = async () => {
  try {
    criticalLog('Starting application initialization');
    
    // Initialize database
    criticalLog('Initializing database...');
    await initializeDatabase().catch(error => {
      console.error(' DATABASE INIT FAILED CRITICAL:', error);
      throw error;
    });
    criticalLog('Database initialized successfully');
    
    // Find and validate root element
    criticalLog('Finding root element...');
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Failed to find the root element');
    }
    criticalLog('Root element found');

    // Create root and render app
    criticalLog('Creating React root...');
    const root = ReactDOM.createRoot(rootElement);
    
    criticalLog('Rendering application...');
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    criticalLog('Initial render complete');
  } catch (error) {
    console.error(' INITIALIZATION FAILED CRITICAL:', error);
    
    // Fallback error display
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center; background-color: #ffdddd;">
          <h1 style="color: red;">Application Initialization Error</h1>
          <pre style="text-align: left; background-color: #f0f0f0; padding: 10px; border-radius: 5px;">
            ${error instanceof Error ? error.stack : 'Unknown error occurred'}
          </pre>
        </div>
      `;
    }
  }
};

// Performance and debugging
performance.mark('app-init-start');
init().then(() => {
  performance.mark('app-init-end');
  performance.measure('app-initialization', 'app-init-start', 'app-init-end');
}).catch(error => {
  console.error(' INIT PROMISE FAILED CRITICAL:', error);
});

console.error(' MAIN.TSX: Script finished parsing CRITICAL');