import React, { useState } from 'react';
import { 
  Box, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel, 
  Heading, 
  VStack,
  Container,
  useColorModeValue
} from '@chakra-ui/react';

import { TemplateCreationForm } from '../components/forms/TemplateCreationForm';
import { TemplateList } from '../components/templates/TemplateList';
import { useCategories } from '../hooks/useCategories';

export const TemplateManagementPage: React.FC = () => {
  const { categories, isLoading: categoriesLoading } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading 
          as="h1" 
          size="xl" 
          textAlign="center" 
          mb={6}
        >
          Template Management
        </Heading>

        <Tabs 
          variant="enclosed" 
          colorScheme="blue"
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          p={4}
        >
          <TabList>
            <Tab>Create Template</Tab>
            <Tab>Manage Templates</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <TemplateCreationForm />
            </TabPanel>
            
            <TabPanel>
              <Box>
                <Heading 
                  as="h2" 
                  size="md" 
                  mb={4}
                >
                  Existing Templates
                </Heading>
                
                {categoriesLoading ? (
                  <Box>Loading categories...</Box>
                ) : (
                  <VStack spacing={4} align="stretch">
                    {categories.map(category => (
                      <TemplateList 
                        key={category.id}
                        categoryId={category.id}
                        categoryName={category.name}
                        onTemplateSelect={(templateId) => {
                          // Future: implement template editing
                          console.log('Selected template:', templateId);
                        }}
                      />
                    ))}
                  </VStack>
                )}
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
};
