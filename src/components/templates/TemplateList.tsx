import React, { useState, useEffect } from 'react';
import { 
  Box, 
  VStack, 
  Text, 
  Spinner, 
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useColorModeValue
} from '@chakra-ui/react';

import { getTemplatesByCategory } from '../../services/templateService';

interface TemplateListProps {
  categoryId: string;
  categoryName: string;
  onTemplateSelect?: (templateId: string) => void;
}

export const TemplateList: React.FC<TemplateListProps> = ({ 
  categoryId, 
  categoryName, 
  onTemplateSelect 
}) => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        const fetchedTemplates = await getTemplatesByCategory(categoryId);
        setTemplates(fetchedTemplates);
      } catch (err) {
        setError('Failed to fetch templates');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [categoryId]);

  if (isLoading) {
    return (
      <Box textAlign="center" py={4}>
        <Spinner size="md" />
        <Text mt={2}>Loading templates...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box color="red.500" textAlign="center" py={4}>
        {error}
      </Box>
    );
  }

  if (templates.length === 0) {
    return (
      <Box 
        bg={bgColor} 
        border="1px" 
        borderColor={borderColor}
        borderRadius="md"
        p={4}
        textAlign="center"
      >
        <Text>No templates found in {categoryName} category</Text>
      </Box>
    );
  }

  return (
    <Box 
      bg={bgColor} 
      border="1px" 
      borderColor={borderColor}
      borderRadius="md"
      p={4}
    >
      <Accordion allowToggle>
        <AccordionItem border="none">
          <AccordionButton 
            bg={useColorModeValue('gray.100', 'gray.600')}
            _hover={{ bg: useColorModeValue('gray.200', 'gray.500') }}
            borderRadius="md"
          >
            <Box flex="1" textAlign="left">
              {categoryName} Templates
              <Badge 
                ml={2} 
                colorScheme="blue"
              >
                {templates.length}
              </Badge>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          
          <AccordionPanel pb={4}>
            <VStack spacing={3} align="stretch">
              {templates.map(template => (
                <Box 
                  key={template.id}
                  bg={useColorModeValue('gray.50', 'gray.800')}
                  p={3}
                  borderRadius="md"
                  cursor="pointer"
                  onClick={() => onTemplateSelect && onTemplateSelect(template.id)}
                  _hover={{ 
                    bg: useColorModeValue('gray.100', 'gray.700'),
                    transform: 'scale(1.02)',
                    transition: 'all 0.2s'
                  }}
                >
                  <Text fontWeight="bold">{template.title}</Text>
                  <Text 
                    fontSize="sm" 
                    color={useColorModeValue('gray.600', 'gray.400')}
                  >
                    {template.description}
                  </Text>
                  <Box mt={2}>
                    <Badge 
                      colorScheme={template.is_default ? 'green' : 'gray'}
                    >
                      {template.is_default ? 'Default Template' : 'Custom Template'}
                    </Badge>
                    <Badge 
                      ml={2} 
                      colorScheme="purple"
                    >
                      Version {template.version}
                    </Badge>
                  </Box>
                </Box>
              ))}
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};
