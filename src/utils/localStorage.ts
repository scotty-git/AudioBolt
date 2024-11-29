import { QuestionnaireTemplate } from '../types/questionnaire';

const TEMPLATES_KEY = 'questionnaire_templates';
const ACTIVE_TEMPLATE_KEY = 'active_template';
const QUESTIONNAIRE_KEY = 'questionnaire';

export const saveTemplate = (template: QuestionnaireTemplate) => {
  const templates = loadTemplates();
  const existingIndex = templates.findIndex(t => t.id === template.id);
  
  if (existingIndex >= 0) {
    templates[existingIndex] = template;
  } else {
    templates.push(template);
  }
  
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  setActiveTemplate(template.id);
  
  // Also save as current questionnaire
  saveQuestionnaire(template);
};

export const loadTemplates = (): QuestionnaireTemplate[] => {
  const data = localStorage.getItem(TEMPLATES_KEY);
  return data ? JSON.parse(data) : [];
};

export const deleteTemplate = (templateId: string) => {
  const templates = loadTemplates().filter(t => t.id !== templateId);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  
  const activeId = getActiveTemplate();
  if (activeId === templateId) {
    clearActiveTemplate();
    clearQuestionnaire();
  }
};

export const setActiveTemplate = (templateId: string) => {
  localStorage.setItem(ACTIVE_TEMPLATE_KEY, templateId);
};

export const getActiveTemplate = (): string | null => {
  return localStorage.getItem(ACTIVE_TEMPLATE_KEY);
};

export const clearActiveTemplate = () => {
  localStorage.removeItem(ACTIVE_TEMPLATE_KEY);
};

export const loadTemplate = (templateId: string): QuestionnaireTemplate | null => {
  const templates = loadTemplates();
  return templates.find(t => t.id === templateId) || null;
};

// Questionnaire-specific functions
export const saveQuestionnaire = (questionnaire: QuestionnaireTemplate) => {
  localStorage.setItem(QUESTIONNAIRE_KEY, JSON.stringify(questionnaire));
};

export const loadQuestionnaire = (): QuestionnaireTemplate | null => {
  const data = localStorage.getItem(QUESTIONNAIRE_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearQuestionnaire = () => {
  localStorage.removeItem(QUESTIONNAIRE_KEY);
};