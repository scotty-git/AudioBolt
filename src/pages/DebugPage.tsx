import React from 'react';
import { FirebaseDebugger } from '../components/debug/FirebaseDebugger';

export const DebugPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Firebase Debug Panel</h1>
        <p className="text-gray-600">
          View and verify Firebase connection status and configuration.
        </p>
      </div>

      <FirebaseDebugger />
    </div>
  );
};