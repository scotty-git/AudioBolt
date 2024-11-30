import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Headphones } from 'lucide-react';
import { NavDropdown } from './NavDropdown';
import { MobileMenu } from './MobileMenu';
import { navigationConfig } from './constants';
import { cn } from '../../../utils/cn';

export const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { menuItems } = navigationConfig;

  return (
    <header className="bg-white shadow-sm backdrop-blur-sm bg-white/90 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <NavLink 
            to="/" 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Headphones className="text-blue-600" size={28} />
            <span className="font-semibold text-gray-900">Self-Help Audio</span>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {menuItems.map((item) => (
              item.submenu ? (
                <NavDropdown
                  key={item.path}
                  label={item.label}
                  items={item.submenu}
                />
              ) : (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors",
                      isActive && "text-blue-700 font-medium"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              )
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            aria-label="Open menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Mobile menu */}
          <MobileMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            menuItems={menuItems}
          />
        </div>
      </div>
    </header>
  );
};