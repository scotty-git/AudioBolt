import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  FormControl, 
  FormLabel, 
  Input, 
  VStack, 
  Select, 
  Checkbox,
  Text,
  useToast
} from '@chakra-ui/react';
import { Formik, Form, Field, FieldArray } from 'formik';
import { 
  TemplateValidationSchema, 
  TemplateFormValues,
  validateTemplate 
} from './TemplateValidationSchema';
import { addTemplate } from '../../services/templateService';
import { useCategories } from '../../hooks/useCategories';

// Field type options
const FIELD_TYPES = [
  'text', 
  'number', 
  'select', 
  'multiselect', 
  'boolean', 
  'date'
];

// Initial template structure
const initialTemplate: TemplateFormValues = {
  title: '',
  description: '',
  category_id: '',
  version: '1.0.0',
  is_default: false,
  content: {
    type: 'questionnaire',
    sections: [{
      title: '',
      fields: [{
        id: '',
        type: 'text',
        label: '',
        validation: {
          required: false
        }
      }]
    }]
  }
};

interface TemplateCreationFormProps {
  onSuccess?: () => void;
}

export const TemplateCreationForm: React.FC<TemplateCreationFormProps> = ({ 
  onSuccess 
}) => {
  const toast = useToast();
  const { categories } = useCategories();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    values: TemplateFormValues, 
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      setIsSubmitting(true);
      
      // Validate template before submission
      await validateTemplate(values);
      
      // Add template to Firestore
      const newTemplateId = await addTemplate(values);
      
      // Success toast
      toast({
        title: 'Template Created',
        description: `Template "${values.title}" created successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      // Reset form
      resetForm();

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error handling
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred';
      
      toast({
        title: 'Template Creation Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box maxWidth="600px" margin="auto">
      <Formik
        initialValues={initialTemplate}
        validationSchema={TemplateValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, setFieldValue }) => (
          <Form>
            <VStack spacing={4}>
              {/* Basic Template Info */}
              <FormControl 
                isInvalid={!!(touched.title && errors.title)}
              >
                <FormLabel>Template Title</FormLabel>
                <Field 
                  as={Input} 
                  name="title" 
                  placeholder="Enter template title" 
                />
                {touched.title && errors.title && (
                  <Text color="red.500">{errors.title}</Text>
                )}
              </FormControl>

              <FormControl 
                isInvalid={!!(touched.description && errors.description)}
              >
                <FormLabel>Description</FormLabel>
                <Field 
                  as={Input} 
                  name="description" 
                  placeholder="Describe the template's purpose" 
                />
                {touched.description && errors.description && (
                  <Text color="red.500">{errors.description}</Text>
                )}
              </FormControl>

              {/* Category Selection */}
              <FormControl 
                isInvalid={!!(touched.category_id && errors.category_id)}
              >
                <FormLabel>Category</FormLabel>
                <Field 
                  as={Select} 
                  name="category_id" 
                  placeholder="Select category"
                >
                  {categories.map(category => (
                    <option 
                      key={category.id} 
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </Field>
                {touched.category_id && errors.category_id && (
                  <Text color="red.500">{errors.category_id}</Text>
                )}
              </FormControl>

              {/* Version and Default Flag */}
              <FormControl>
                <FormLabel>Version</FormLabel>
                <Field 
                  as={Input} 
                  name="version" 
                  placeholder="1.0.0" 
                />
                {touched.version && errors.version && (
                  <Text color="red.500">{errors.version}</Text>
                )}
              </FormControl>

              <FormControl>
                <Field 
                  as={Checkbox} 
                  name="is_default"
                >
                  Set as Default Template
                </Field>
              </FormControl>

              {/* Sections and Fields */}
              <FieldArray name="content.sections">
                {({ push: pushSection, remove: removeSection }) => (
                  <>
                    {values.content.sections.map((section, sectionIndex) => (
                      <Box 
                        key={sectionIndex} 
                        border="1px" 
                        borderColor="gray.200" 
                        p={4}
                      >
                        <FormControl>
                          <FormLabel>Section Title</FormLabel>
                          <Field
                            as={Input}
                            name={`content.sections.${sectionIndex}.title`}
                            placeholder="Section title"
                          />
                        </FormControl>

                        <FieldArray 
                          name={`content.sections.${sectionIndex}.fields`}
                        >
                          {({ push: pushField, remove: removeField }) => (
                            <>
                              {section.fields.map((field, fieldIndex) => (
                                <Box 
                                  key={fieldIndex} 
                                  mt={2}
                                >
                                  <FormControl>
                                    <FormLabel>Field ID</FormLabel>
                                    <Field
                                      as={Input}
                                      name={`content.sections.${sectionIndex}.fields.${fieldIndex}.id`}
                                      placeholder="field_id"
                                    />
                                  </FormControl>

                                  <FormControl>
                                    <FormLabel>Field Type</FormLabel>
                                    <Field
                                      as={Select}
                                      name={`content.sections.${sectionIndex}.fields.${fieldIndex}.type`}
                                    >
                                      {FIELD_TYPES.map(type => (
                                        <option 
                                          key={type} 
                                          value={type}
                                        >
                                          {type}
                                        </option>
                                      ))}
                                    </Field>
                                  </FormControl>

                                  <Button 
                                    size="sm" 
                                    onClick={() => removeField(fieldIndex)}
                                  >
                                    Remove Field
                                  </Button>
                                </Box>
                              ))}
                              <Button 
                                mt={2} 
                                onClick={() => pushField({ 
                                  id: '', 
                                  type: 'text', 
                                  label: '',
                                  validation: { required: false } 
                                })}
                              >
                                Add Field
                              </Button>
                            </>
                          )}
                        </FieldArray>

                        <Button 
                          mt={2} 
                          onClick={() => removeSection(sectionIndex)}
                        >
                          Remove Section
                        </Button>
                      </Box>
                    ))}
                    <Button 
                      mt={2} 
                      onClick={() => pushSection({ 
                        title: '', 
                        fields: [{ 
                          id: '', 
                          type: 'text', 
                          label: '',
                          validation: { required: false } 
                        }] 
                      })}
                    >
                      Add Section
                    </Button>
                  </>
                )}
              </FieldArray>

              {/* Submit Button */}
              <Button 
                type="submit" 
                colorScheme="blue"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Create Template
              </Button>
            </VStack>
          </Form>
        )}
      </Formik>
    </Box>
  );
};
