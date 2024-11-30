import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from './components/auth/AuthProvider';
import { routes } from './routes';
import { ErrorBoundary } from './components/ErrorBoundary';

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const router = createBrowserRouter(routes);

function App() {
  return (
    <ErrorBoundary>
      <ChakraProvider>
        <AuthProvider fallback={<LoadingSpinner />}>
          <RouterProvider router={router} />
        </AuthProvider>
      </ChakraProvider>
    </ErrorBoundary>
  );
}

export default App;