import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  getUserSubmissions,
  getTemplates,
  type Template,
  type OnboardingSubmission,
  type QuestionnaireSubmission,
  type QueryOptions
} from '../lib/firebase/database';

// Types for template management
export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  count: number;
}

interface SubmissionsState {
  onboarding: OnboardingSubmission[];
  questionnaires: QuestionnaireSubmission[];
  loading: boolean;
  error: Error | null;
}

interface TemplateCategoriesState {
  categories: TemplateCategory[];
  loading: boolean;
  error: Error | null;
}

interface TemplateManagementState {
  templates: Template[];
  loading: boolean;
  error: Error | null;
}

// Hook for user submissions
export const useUserSubmissions = (options?: Omit<QueryOptions, 'where'>) => {
  const { user } = useAuth();
  const [state, setState] = useState<SubmissionsState>({
    onboarding: [],
    questionnaires: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const fetchSubmissions = async () => {
      if (!user) {
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const submissions = await getUserSubmissions(user.uid, options);
        
        if (mounted) {
          setState({
            onboarding: submissions.onboarding,
            questionnaires: submissions.questionnaires,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        if (mounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: error as Error,
          }));
        }
      }
    };

    fetchSubmissions();

    return () => {
      mounted = false;
    };
  }, [user, options]);

  const refetch = useCallback(async () => {
    if (!user) return;
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const submissions = await getUserSubmissions(user.uid, options);
      setState({
        onboarding: submissions.onboarding,
        questionnaires: submissions.questionnaires,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
    }
  }, [user, options]);

  return { ...state, refetch };
};

// Hook for template categories
export const useTemplateCategories = () => {
  const [state, setState] = useState<TemplateCategoriesState>({
    categories: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const fetchCategories = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        // Fetch all templates
        const templates = await getTemplates();
        
        // Process templates into categories
        const categoryMap = new Map<string, TemplateCategory>();
        
        templates.forEach(template => {
          const existing = categoryMap.get(template.category);
          if (existing) {
            existing.count++;
          } else {
            categoryMap.set(template.category, {
              id: template.category,
              name: template.category, // You might want to map this to a display name
              description: '', // You might want to add descriptions in your templates
              count: 1,
            });
          }
        });

        if (mounted) {
          setState({
            categories: Array.from(categoryMap.values()),
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        if (mounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: error as Error,
          }));
        }
      }
    };

    fetchCategories();

    return () => {
      mounted = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const templates = await getTemplates();
      const categoryMap = new Map<string, TemplateCategory>();
      
      templates.forEach(template => {
        const existing = categoryMap.get(template.category);
        if (existing) {
          existing.count++;
        } else {
          categoryMap.set(template.category, {
            id: template.category,
            name: template.category,
            description: '',
            count: 1,
          });
        }
      });

      setState({
        categories: Array.from(categoryMap.values()),
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
    }
  }, []);

  return { ...state, refetch };
};

// Hook for template management
export const useTemplateManagement = (category?: string) => {
  const [state, setState] = useState<TemplateManagementState>({
    templates: [],
    loading: true,
    error: null,
  });

  // Fetch templates based on category
  useEffect(() => {
    let mounted = true;

    const fetchTemplates = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const options: QueryOptions = category
          ? {
              where: [{
                field: 'category',
                operator: '==',
                value: category,
              }],
              orderBy: { field: 'createdAt', direction: 'desc' },
            }
          : { orderBy: { field: 'createdAt', direction: 'desc' } };

        const templates = await getTemplates(options);
        
        if (mounted) {
          setState({
            templates,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        if (mounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: error as Error,
          }));
        }
      }
    };

    fetchTemplates();

    return () => {
      mounted = false;
    };
  }, [category]);

  const refetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const options: QueryOptions = category
        ? {
            where: [{
              field: 'category',
              operator: '==',
              value: category,
            }],
            orderBy: { field: 'createdAt', direction: 'desc' },
          }
        : { orderBy: { field: 'createdAt', direction: 'desc' } };

      const templates = await getTemplates(options);
      setState({
        templates,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
    }
  }, [category]);

  return {
    ...state,
    refetch,
  };
};
