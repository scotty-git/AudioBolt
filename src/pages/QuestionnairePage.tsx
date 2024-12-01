import React from 'react';
import { useParams } from 'react-router-dom';
import { getDatabase } from '../db/client';

export function QuestionnairePage() {
  const { templateId } = useParams();
  const [template, setTemplate] = React.useState(null);

  React.useEffect(() => {
    const loadTemplate = async () => {
      if (!templateId) return;
      
      try {
        const db = getDatabase();
        const template = await db.get('templates', templateId);
        setTemplate(template);
      } catch (error) {
        console.error('Failed to load template:', error);
      }
    };

    loadTemplate();
  }, [templateId]);

  if (!template) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{template.title}</h1>
      {/* Add your questionnaire UI here */}
    </div>
  );
}