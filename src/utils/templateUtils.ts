import { Template } from '../db/schema';
import { templateRepository } from '../db/repositories';
import { v4 as uuidv4 } from 'uuid';

export const duplicateTemplate = async (
  template: Template,
  newTitle: string,
  content: any
): Promise<Template> => {
  const now = new Date().toISOString();
  
  return templateRepository.create({
    title: newTitle,
    type: template.type,
    content: JSON.stringify({
      ...content,
      id: uuidv4(),
      title: newTitle,
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    }),
    is_default: false,
    version: template.version,
    status: 'published',
  });
};

export const ensureDefaultTemplate = async (type: Template['type']): Promise<Template> => {
  const defaultTemplate = await templateRepository.getDefaultTemplate(type);
  
  if (defaultTemplate) {
    return defaultTemplate;
  }

  const templates = await templateRepository.findByType(type);
  if (templates.length > 0) {
    return templateRepository.setDefault(templates[0].id);
  }

  throw new Error(`No ${type} templates available`);
};