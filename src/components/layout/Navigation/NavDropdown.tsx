import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface NavDropdownProps {
  label: string;
  items: {
    path: string;
    label: string;
  }[];
}

export const NavDropdown: React.FC<NavDropdownProps> = ({ label, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center gap-1 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {label}
        <ChevronDown 
          size={16} 
          className={cn(
            "transition-transform duration-200",
            isOpen && "transform rotate-180"
          )} 
        />
      </button>
      
      {isOpen && (
        <div 
          className="absolute left-0 mt-1 w-56 bg-white rounded-md shadow-lg py-1 z-50 animate-fadeIn"
          role="menu"
        >
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                cn(
                  "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors",
                  isActive && "bg-blue-50 text-blue-700 font-medium"
                )
              }
              role="menuitem"
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};