import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: {
    label: string;
    path: string;
    submenu?: { label: string; path: string; }[];
  }[];
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, menuItems }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-64 bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>
        
        <nav className="p-4">
          {menuItems.map((item) => (
            <div key={item.path} className="mb-2">
              {item.submenu ? (
                <>
                  <div className="px-4 py-2 text-sm font-medium text-gray-900">
                    {item.label}
                  </div>
                  <div className="ml-4">
                    {item.submenu.map((subitem) => (
                      <NavLink
                        key={subitem.path}
                        to={subitem.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          cn(
                            "block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded",
                            isActive && "bg-blue-50 text-blue-700"
                          )
                        }
                      >
                        {subitem.label}
                      </NavLink>
                    ))}
                  </div>
                </>
              ) : (
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded",
                      isActive && "bg-blue-50 text-blue-700"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};