import React from 'react';
import { NavLink } from 'react-router-dom';
import { Book, Settings, ClipboardList } from 'lucide-react';

export const Navigation: React.FC = () => {
  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
      isActive
        ? 'bg-blue-50 text-blue-700 shadow-sm'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;

  return (
    <header className="bg-white shadow-sm backdrop-blur-sm bg-white/90 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Book className="text-blue-600" size={28} />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Audiobook Questionnaire
              </h1>
              <p className="text-sm text-gray-500">Create and manage your templates</p>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <NavLink to="/builder" className={getLinkClass}>
              <Settings size={18} />
              <span>Builder</span>
            </NavLink>
            <NavLink to="/questionnaire" className={getLinkClass}>
              <Book size={18} />
              <span>Questionnaire</span>
            </NavLink>
            <NavLink to="/submissions" className={getLinkClass}>
              <ClipboardList size={18} />
              <span>Submissions</span>
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
};