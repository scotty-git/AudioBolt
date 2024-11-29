import { 
  collection, 
  doc, 
  getDoc, 
  query, 
  where, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';
import { COLLECTIONS } from './collections';
import * as fs from 'fs';
import * as path from 'path';

// Custom logging function
const logError = (message: string, details?: any) => {
  const logDir = path.join(process.cwd(), 'logs');
  
  // Ensure logs directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, 'template-validation.log');
  const timestamp = new Date().toISOString();
  
  const logEntry = `${timestamp} - ERROR: ${message}\n${
    details ? JSON.stringify(details, null, 2) : ''
  }\n\n`;

  fs.appendFileSync(logFile, logEntry);
  console.error(message, details);
};

// Custom error class for template validation
class TemplateValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TemplateValidationError';
  }
}

// Validation interface
interface TemplateValidationResult {
  isValid: boolean;
  errors: string[];
}

// Template validation service
export class TemplateValidationService {
  // Validate category existence
  private async validateCategory(categoryId: string): Promise<boolean> {
    try {
      const categoryRef = doc(db, COLLECTIONS.TEMPLATE_CATEGORIES, categoryId);
      const categorySnap = await getDoc(categoryRef);
      
      return categorySnap.exists();
    } catch (error) {
      logError('Category validation error', { 
        categoryId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return false;
    }
  }

  // Check for existing default template in category
  private async checkExistingDefaultTemplate(categoryId: string): Promise<boolean> {
    try {
      const templatesRef = collection(db, COLLECTIONS.TEMPLATES);
      const q = query(
        templatesRef, 
        where('category_id', '==', categoryId),
        where('is_default', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.size > 0;
    } catch (error) {
      logError('Default template check error', { 
        categoryId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return true; // Fail safe
    }
  }

  // Validate template structure
  private validateTemplateStructure(template: any): string[] {
    const errors: string[] = [];

    // Required top-level fields
    const requiredFields = [
      'title', 
      'description', 
      'category_id', 
      'content', 
      'version'
    ];

    requiredFields.forEach(field => {
      if (!template[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Validate content structure
    if (template.content) {
      if (!template.content.sections || !Array.isArray(template.content.sections)) {
        errors.push('Content must have a valid sections array');
      }
    }

    // Validate version format
    const versionRegex = /^\d+\.\d+(\.\d+)?$/;
    if (template.version && !versionRegex.test(template.version)) {
      errors.push(`Invalid version format: ${template.version}. Use format like '1.0' or '1.0.0'`);
    }

    return errors;
  }

  // Comprehensive template validation
  async validateTemplate(template: any): Promise<TemplateValidationResult> {
    const errors: string[] = [];

    // 1. Validate Category
    const categoryValid = await this.validateCategory(template.category_id);
    if (!categoryValid) {
      errors.push(`Invalid category: ${template.category_id}`);
      logError('Template validation failed', { 
        reason: 'Invalid category', 
        categoryId: template.category_id 
      });
    }

    // 2. Check for existing default template
    if (template.is_default) {
      const hasExistingDefault = await this.checkExistingDefaultTemplate(template.category_id);
      if (hasExistingDefault) {
        errors.push(`A default template already exists in category: ${template.category_id}`);
        logError('Template validation failed', { 
          reason: 'Multiple default templates', 
          categoryId: template.category_id 
        });
      }
    }

    // 3. Validate template structure
    const structureErrors = this.validateTemplateStructure(template);
    errors.push(...structureErrors);

    // Prepare validation result
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Middleware for template creation
  async validateAndPrepareTemplate(template: any): Promise<any> {
    // Run comprehensive validation
    const validationResult = await this.validateTemplate(template);

    // If validation fails, throw detailed error
    if (!validationResult.isValid) {
      const errorMessage = validationResult.errors.join('; ');
      logError('Template validation failed', { 
        errors: validationResult.errors,
        template 
      });
      
      throw new TemplateValidationError(errorMessage);
    }

    // Prepare template for creation
    return {
      ...template,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    };
  }
}

// Export a singleton instance
export const templateValidationService = new TemplateValidationService();
