import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeDatabase } from './db/client';

const init = async () => {
  try {
    await initializeDatabase();
    
    const rootElement = document.getElementById('root');
    if (!rootElement) throw new Error('Failed to find the root element');

    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to initialize application:', error);
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui;">
          <div style="text-align: center; max-width: 500px; padding: 20px;">
            <h1 style="color: #1d4ed8; margin-bottom: 1rem; font-size: 1.5rem;">Application Error</h1>
            <p style="color: #374151;">Failed to initialize the application. Please try refreshing the page.</p>
            <p style="color: #374151; font-size: 0.875rem; margin-top: 0.5rem;">${error.message}</p>
          </div>
        </div>
      `;
    }
  }
};

init();