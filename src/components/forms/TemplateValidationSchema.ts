import * as Yup from 'yup';

// Validation schema for template sections
const sectionSchema = Yup.object().shape({
  title: Yup.string()
    .required('Section title is required')
    .min(2, 'Section title must be at least 2 characters')
    .max(100, 'Section title cannot exceed 100 characters'),
  
  fields: Yup.array()
    .of(
      Yup.object().shape({
        id: Yup.string()
          .required('Field ID is required')
          .matches(/^[a-z_]+$/, 'Field ID must be lowercase with underscores'),
        
        type: Yup.string()
          .oneOf([
            'text', 
            'number', 
            'select', 
            'multiselect', 
            'boolean', 
            'date'
          ], 'Invalid field type'),
        
        label: Yup.string()
          .required('Field label is required')
          .min(2, 'Field label must be at least 2 characters')
          .max(100, 'Field label cannot exceed 100 characters'),
        
        validation: Yup.object().shape({
          required: Yup.boolean(),
          min: Yup.number(),
          max: Yup.number(),
          pattern: Yup.string()
        })
      })
    )
    .min(1, 'At least one field is required in a section')
});

// Comprehensive template validation schema
export const TemplateValidationSchema = Yup.object().shape({
  // Basic template information
  title: Yup.string()
    .required('Template title is required')
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  
  description: Yup.string()
    .required('Template description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description cannot exceed 500 characters'),
  
  // Category validation
  category_id: Yup.string()
    .required('Category is required')
    .matches(/^[a-z_]+$/, 'Category ID must be lowercase with underscores'),
  
  // Version validation
  version: Yup.string()
    .required('Version is required')
    .matches(
      /^\d+\.\d+(\.\d+)?$/, 
      'Version must be in format X.Y or X.Y.Z (e.g., 1.0 or 1.0.0)'
    ),
  
  // Content structure validation
  content: Yup.object().shape({
    type: Yup.string()
      .oneOf([
        'questionnaire', 
        'assessment', 
        'onboarding', 
        'survey'
      ], 'Invalid content type'),
    
    sections: Yup.array()
      .of(sectionSchema)
      .min(1, 'At least one section is required')
      .max(10, 'Cannot exceed 10 sections')
  }),
  
  // Optional flags
  is_default: Yup.boolean().default(false),
  is_active: Yup.boolean().default(true),
  
  // Metadata
  created_at: Yup.date(),
  updated_at: Yup.date()
});

// Type inference for TypeScript
export type TemplateFormValues = Yup.InferType<typeof TemplateValidationSchema>;

// Utility function to validate template
export const validateTemplate = async (template: any): Promise<void> => {
  try {
    await TemplateValidationSchema.validate(template, { abortEarly: false });
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      const validationErrors: Record<string, string> = {};
      
      error.inner.forEach(err => {
        if (err.path) {
          validationErrors[err.path] = err.message;
        }
      });
      
      throw new Error(JSON.stringify(validationErrors));
    }
    throw error;
  }
};
