import { templateRepository } from '../repositories';
import { defaultOnboardingFlow } from '../../data/defaultOnboardingFlow';
import { defaultQuestionnaires } from '../../data/defaultQuestionnaires';

export const runInitialMigration = async () => {
  try {
    // Check if templates already exist
    const existingTemplates = await templateRepository.findAll();
    if (existingTemplates.length > 0) {
      console.log('Templates already exist, skipping initial migration');
      return;
    }

    // Create default onboarding template
    await templateRepository.create({
      title: defaultOnboardingFlow.title,
      type: 'onboarding',
      content: JSON.stringify(defaultOnboardingFlow),
      is_default: true,
      status: 'published',
      version: '1.0.0',
    });

    // Create default questionnaire templates
    for (const questionnaire of defaultQuestionnaires) {
      await templateRepository.create({
        title: questionnaire.title,
        type: 'questionnaire',
        content: JSON.stringify(questionnaire),
        is_default: questionnaire.isDefault,
        status: 'published',
        version: questionnaire.version,
      });
    }

    console.log('Successfully created initial templates');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};