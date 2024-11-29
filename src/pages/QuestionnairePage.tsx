import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSubmissions } from '../hooks/useSubmissions';
import { templateDb } from '../lib/firebase/db';
import { LoadingSpinner } from '../components/feedback/LoadingSpinner';
import { SectionProgress } from '../components/Questionnaire/SectionProgress';
import { SectionRenderer } from '../components/Questionnaire/SectionRenderer';
import { SubmissionConfirmation } from '../components/Questionnaire/SubmissionConfirmation';
import { v4 as uuidv4 } from 'uuid';

export const QuestionnairePage: React.FC = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { submitQuestionnaire } = useSubmissions();
  const [template, setTemplate] = useState<any>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setIsLoading(true);
        if (!templateId) return;
        
        const loadedTemplate = await templateDb.getById(templateId);
        if (loadedTemplate) {
          setTemplate(loadedTemplate);
        }
      } catch (error) {
        console.error('Error loading template:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [templateId]);

  const handleAnswer = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    setErrors(prev => ({
      ...prev,
      [questionId]: ''
    }));
  };

  const validateSection = (sectionIndex: number) => {
    const section = template.sections[sectionIndex];
    const sectionErrors: Record<string, string> = {};
    let isValid = true;

    section.questions.forEach(question => {
      if (question.validation?.required && !answers[question.id]) {
        sectionErrors[question.id] = 'This question is required';
        isValid = false;
      }
    });

    setErrors(sectionErrors);
    return isValid;
  };

  const handleNext = () => {
    if (!validateSection(currentSectionIndex)) return;

    const currentSection = template.sections[currentSectionIndex];
    setCompletedSections(prev => [...prev, currentSection.id]);

    if (currentSectionIndex < template.sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!template || !templateId) return;

    try {
      await submitQuestionnaire({
        templateId,
        answers,
        metadata: {
          templateTitle: template.title,
          completedSections,
          currentSectionIndex,
          content: JSON.stringify(template)
        }
      });
      
      setShowConfirmation(true);
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Template Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested questionnaire template could not be found.
          </p>
          <Link
            to="/questionnaires/user"
            className="text-blue-600 hover:text-blue-700"
          >
            ← Back to Questionnaires
          </Link>
        </div>
      </div>
    );
  }

  const currentSection = template.sections[currentSectionIndex];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        to="/questionnaires/user"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="mr-2" size={20} />
        Back to Questionnaires
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{template.title}</h1>
        <p className="text-gray-600">{template.description}</p>
      </div>

      <SectionProgress
        sections={template.sections}
        currentSectionIndex={currentSectionIndex}
        completedSections={completedSections}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <SectionRenderer
          section={currentSection}
          answers={answers}
          onAnswer={handleAnswer}
          errors={errors}
        />
      </div>

      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentSectionIndex === 0}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md
                   hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {currentSectionIndex === template.sections.length - 1 ? 'Submit' : 'Next'}
        </button>
      </div>

      {showConfirmation && (
        <SubmissionConfirmation
          onClose={() => {
            setShowConfirmation(false);
            navigate('/submissions');
          }}
        />
      )}
    </div>
  );
};