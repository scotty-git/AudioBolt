import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TemplateBuilder } from '../components/QuestionBuilder/TemplateBuilder';
import { JsonImport } from '../components/QuestionBuilder/JsonImport';
import { templateRepository } from '../db/repositories';
import { LoadingSpinner } from '../components/feedback/LoadingSpinner';
import { Headphones } from 'lucide-react';
import { Section } from '../types/common';

export const BuilderPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(!!id);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    if (id) {
      loadTemplate();
    }
  }, [id]);

  const loadTemplate = async () => {
    try {
      setIsLoading(true);
      const template = await templateRepository.findById(id);
      if (template && template.type === 'questionnaire') {
        const data = JSON.parse(template.content);
        setTitle(template.title);
        setDescription(data.description || '');
        setSections(data.sections || []);
      }
    } catch (error) {
      console.error('Error loading template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a template title');
      return;
    }

    try {
      const templateData = {
        title,
        type: 'questionnaire' as const,
        content: JSON.stringify({
          description,
          sections,
          settings: {
            allowSkipSections: false,
            showProgressBar: true,
            shuffleSections: false,
          },
          metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        }),
        is_default: false,
        status: 'draft' as const,
        version: '1.0.0',
      };

      if (id) {
        await templateRepository.update(id, templateData);
      } else {
        await templateRepository.create(templateData);
      }

      navigate('/templates');
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleImport = (data: any) => {
    setTitle(data.title);
    setDescription(data.description);
    setSections(data.sections);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Headphones className="text-blue-600" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {id ? 'Edit Questionnaire' : 'Create Questionnaire'}
            </h1>
            <p className="text-gray-600">
              Design your audiobook questionnaire template
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter template title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Enter template description"
            />
          </div>
        </div>
      </div>

      <TemplateBuilder
        sections={sections}
        onSectionsChange={setSections}
      />

      <div className="flex justify-end gap-4">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Save Template
        </button>
      </div>

      <JsonImport onImport={handleImport} />
    </div>
  );
};