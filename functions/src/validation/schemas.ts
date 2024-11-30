import * as yup from 'yup';
import { Submission } from '../types/submission';

// Response field schemas based on template types
export const RESPONSE_SCHEMAS = {
  text: yup.string().required(),
  number: yup.number().required(),
  boolean: yup.boolean().required(),
  select: yup.string().required(),
  multiSelect: yup.array().of(yup.string()).required(),
  date: yup.date().required(),
  file: yup.object({
    url: yup.string().url().required(),
    filename: yup.string().required(),
    contentType: yup.string().required(),
    size: yup.number().positive().required()
  }).required()
};

// Optional fields schema
export const OPTIONAL_FIELDS_SCHEMA = yup.object({
  notes: yup.string().max(1000).nullable(),
  tags: yup.array().of(yup.string().max(50)).max(10).nullable(),
  priority: yup.string().oneOf(['low', 'medium', 'high']).nullable(),
  dueDate: yup.date().nullable(),
  assignedTo: yup.string().nullable(),
  customFields: yup.object().nullable()
});

// Submission validation result
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Validation error types
export interface ValidationError {
  type: 'foreign_key' | 'schema' | 'optional_field';
  field: string;
  message: string;
  submissionId: string;
  severity: 'error' | 'warning';
  timestamp: FirebaseFirestore.Timestamp;
}

// Template response field definition
export interface TemplateField {
  id: string;
  type: keyof typeof RESPONSE_SCHEMAS;
  label: string;
  required: boolean;
  options?: string[]; // For select/multiSelect
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    customValidator?: string;
  };
}

// Template schema
export interface Template {
  id: string;
  fields: TemplateField[];
  version: number;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

// Build dynamic schema based on template
export function buildResponseSchema(template: Template): yup.ObjectSchema<any> {
  const schemaShape: Record<string, any> = {};

  template.fields.forEach(field => {
    let fieldSchema = RESPONSE_SCHEMAS[field.type];

    // Apply custom validation rules
    if (field.validation) {
      if (field.validation.min !== undefined) {
        fieldSchema = fieldSchema.min(field.validation.min);
      }
      if (field.validation.max !== undefined) {
        fieldSchema = fieldSchema.max(field.validation.max);
      }
      if (field.validation.pattern) {
        fieldSchema = fieldSchema.matches(new RegExp(field.validation.pattern));
      }
    }

    // Make field optional if not required
    if (!field.required) {
      fieldSchema = fieldSchema.nullable();
    }

    schemaShape[field.id] = fieldSchema;
  });

  return yup.object(schemaShape);
}
