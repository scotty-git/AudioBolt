import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation/Navigation';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full">
        <div className="animate-fadeIn">
          <Outlet />
        </div>
      </main>
    </div>
  );
};