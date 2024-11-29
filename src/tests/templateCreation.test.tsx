import React from 'react';
import { 
  render, 
  screen, 
  fireEvent, 
  waitFor 
} from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { TemplateCreationForm } from '../components/forms/TemplateCreationForm';
import { addTemplate } from '../services/templateService';
import { useCategories } from '../hooks/useCategories';

// Mock dependencies
jest.mock('../services/templateService');
jest.mock('../hooks/useCategories');

describe('Template Creation Workflow', () => {
  // Mock categories for testing
  const mockCategories = [
    { id: 'questionnaire', name: 'Questionnaire' },
    { id: 'onboarding', name: 'Onboarding' }
  ];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup category hook mock
    (useCategories as jest.Mock).mockReturnValue({
      categories: mockCategories,
      isLoading: false,
      error: null
    });
  });

  const renderTemplateForm = () => {
    return render(
      <ChakraProvider>
        <TemplateCreationForm />
      </ChakraProvider>
    );
  };

  // Test Case 1: Successful Template Creation
  test('creates template successfully', async () => {
    // Mock successful template addition
    (addTemplate as jest.Mock).mockResolvedValue('template-123');

    const { getByPlaceholderText, getByText } = renderTemplateForm();

    // Fill out the form
    fireEvent.change(getByPlaceholderText('Enter template title'), {
      target: { value: 'Test Template' }
    });

    fireEvent.change(getByPlaceholderText('Describe the template\'s purpose'), {
      target: { value: 'A comprehensive test template' }
    });

    // Select category
    fireEvent.change(screen.getByRole('combobox', { name: /category/i }), {
      target: { value: 'questionnaire' }
    });

    // Submit form
    fireEvent.click(getByText('Create Template'));

    // Wait for success
    await waitFor(() => {
      expect(addTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Template',
          description: 'A comprehensive test template',
          category_id: 'questionnaire'
        })
      );
    });
  });

  // Test Case 2: Validation Failures
  test('prevents submission with invalid data', async () => {
    const { getByText } = renderTemplateForm();

    // Attempt to submit empty form
    fireEvent.click(getByText('Create Template'));

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
      expect(screen.getByText(/category is required/i)).toBeInTheDocument();
    });
  });

  // Test Case 3: Handling Server-Side Errors
  test('handles server-side template creation errors', async () => {
    // Mock server error
    (addTemplate as jest.Mock).mockRejectedValue(
      new Error('A default template already exists in this category')
    );

    const { getByPlaceholderText, getByText } = renderTemplateForm();

    // Fill out the form
    fireEvent.change(getByPlaceholderText('Enter template title'), {
      target: { value: 'Duplicate Default Template' }
    });

    fireEvent.change(getByPlaceholderText('Describe the template\'s purpose'), {
      target: { value: 'Attempting to create a duplicate default template' }
    });

    fireEvent.change(screen.getByRole('combobox', { name: /category/i }), {
      target: { value: 'questionnaire' }
    });

    // Check default template checkbox
    fireEvent.click(screen.getByText('Set as Default Template'));

    // Submit form
    fireEvent.click(getByText('Create Template'));

    // Wait for error handling
    await waitFor(() => {
      expect(screen.getByText(/template creation failed/i)).toBeInTheDocument();
      expect(
        screen.getByText(/a default template already exists in this category/i)
      ).toBeInTheDocument();
    });
  });

  // Test Case 4: Dynamic Section and Field Addition
  test('supports dynamic section and field addition', () => {
    const { getByText } = renderTemplateForm();

    // Add a new section
    fireEvent.click(getByText('Add Section'));

    // Verify section added
    const sectionTitles = screen.getAllByPlaceholderText('Section title');
    expect(sectionTitles.length).toBe(2);

    // Add a field to the new section
    const addFieldButtons = screen.getAllByText('Add Field');
    fireEvent.click(addFieldButtons[1]);

    // Verify field added to second section
    const fieldIdInputs = screen.getAllByPlaceholderText('field_id');
    expect(fieldIdInputs.length).toBe(2);
  });
});

// Documentation Generation
const templateCreationDocumentation = `
# Template Creation Workflow Documentation

## Overview
The template creation system provides a robust, flexible interface for creating dynamic templates with comprehensive validation.

## Key Components
- \`TemplateCreationForm\`: Dynamic form for template creation
- \`TemplateValidationSchema\`: Comprehensive validation rules
- \`templateService\`: Backend template management

## Validation Layers
1. Client-Side Validation
   - Immediate user feedback
   - Prevents submission of obviously invalid data
   - Checks:
     * Required fields
     * Field formats
     * Content structure

2. Server-Side Validation
   - Definitive validation before database insertion
   - Checks:
     * Category existence
     * Unique default template constraints
     * Database-specific rules

## Future Enhancements
1. More granular field validation
2. Template versioning
3. Advanced field configuration
4. Comprehensive error logging
5. Performance optimization

## Best Practices
- Always validate both client and server-side
- Provide clear, actionable error messages
- Support dynamic template structures
- Maintain type safety

## Known Limitations
- Manual prevention of multiple default templates
- Potential performance considerations with large collections
`;

// Write documentation to a file
import * as fs from 'fs';
import * as path from 'path';

const docPath = path.resolve(
  __dirname, 
  '../docs/TEMPLATE_CREATION_WORKFLOW.md'
);

fs.writeFileSync(docPath, templateCreationDocumentation);

export default templateCreationDocumentation;
