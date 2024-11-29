import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Headphones, ArrowRight, Loader2 } from 'lucide-react';
import { templateRepository } from '../../db/repositories';
import { Template } from '../../db/schema';
import { formatDate } from '../../utils/dateUtils';

export const QuestionnaireSelection: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const allTemplates = await templateRepository.findByType('questionnaire');
        setTemplates(allTemplates.filter(t => t.status === 'published'));
      } catch (error) {
        console.error('Error loading templates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <Headphones className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Questionnaires Available</h2>
        <p className="text-gray-600 mb-6">There are currently no published questionnaires available.</p>
        <button
          onClick={() => navigate('/templates')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          View Templates
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Select a Questionnaire</h1>
        <p className="text-gray-600">Choose a questionnaire to begin your self-improvement journey</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const data = JSON.parse(template.content);
          return (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {template.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {data.description}
                </p>
                <div className="text-sm text-gray-500 mb-4">
                  Last updated: {formatDate(template.updated_at)}
                </div>
                <button
                  onClick={() => navigate(`/questionnaires/user/${template.id}`)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors gap-2"
                >
                  Start Questionnaire
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};