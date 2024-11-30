import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Headphones,
  PencilRuler,
  Users,
  ClipboardList
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <Headphones className="h-16 w-16 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Self-Help Audiobook Portal
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Create and manage personalized onboarding flows and questionnaires for your self-help audiobook platform.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {[
          {
            icon: PencilRuler,
            title: 'Template Builder',
            description: 'Create and customize onboarding flows and questionnaires',
            path: '/templates'
          },
          {
            icon: Users,
            title: 'User Onboarding',
            description: 'Guide users through their personalized journey',
            path: '/onboarding/user'
          },
          {
            icon: ClipboardList,
            title: 'Submissions',
            description: 'View and manage user responses',
            path: '/submissions'
          }
        ].map((feature, index) => (
          <button
            key={index}
            onClick={() => navigate(feature.path)}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-200 text-left"
          >
            <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600">{feature.description}</p>
          </button>
        ))}
      </div>

      <div className="bg-blue-50 rounded-lg p-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Get Started Today
          </h2>
          <p className="text-gray-600 mb-6">
            Begin by creating your first onboarding flow or questionnaire. Our intuitive
            tools make it easy to design engaging content for your audiobook users.
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => navigate('/onboarding/builder')}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Onboarding
            </button>
            <button 
              onClick={() => navigate('/questionnaires/builder')}
              className="px-6 py-2 bg-white text-blue-600 rounded-md hover:bg-gray-50 transition-colors"
            >
              Build Questionnaire
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};