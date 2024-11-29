import { v4 as uuidv4 } from 'uuid';

export const defaultOnboardingFlow = {
  id: "initial-user-onboarding",
  title: "Initial User Onboarding",
  description: "Help us get to know you better so we can create the perfect self-help audiobook tailored to your needs.",
  version: "1.0.0",
  type: "onboarding" as const,
  isDefault: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  sections: [
    {
      id: "personal-info",
      title: "Personal Information",
      description: "Tell us a bit about yourself.",
      order: 0,
      questions: [
        {
          id: "full-name",
          type: "text",
          text: "What is your full name?",
          placeholder: "Enter your name",
          validation: {
            required: true,
            minLength: 2,
            maxLength: 400
          }
        },
        {
          id: "age",
          type: "number",
          text: "What is your age?",
          placeholder: "Enter your age",
          validation: {
            required: true,
            min: 10,
            max: 120
          }
        },
        {
          id: "location",
          type: "text",
          text: "Where are you located?",
          placeholder: "City, Country",
          validation: {
            required: true,
            minLength: 2,
            maxLength: 400
          }
        },
        {
          id: "sex",
          type: "select",
          text: "What is your gender?",
          options: [
            { id: "male", text: "Male", value: "male" },
            { id: "female", text: "Female", value: "female" },
            { id: "other", text: "Other", value: "other" }
          ],
          validation: {
            required: true
          }
        }
      ]
    },
    {
      id: "core-values",
      title: "Your Core Values",
      description: "Help us understand what drives and motivates you.",
      order: 1,
      questions: [
        {
          id: "guiding-principles",
          type: "long_text",
          text: "What values or principles guide your decisions?",
          placeholder: "E.g., Honesty, Family, Health",
          validation: {
            required: true,
            minLength: 10,
            maxLength: 1200
          }
        },
        {
          id: "motivational-factors",
          type: "checkbox",
          text: "What motivates you the most? (Select all that apply)",
          options: [
            { id: "recognition", text: "Recognition", value: "recognition" },
            { id: "achievement", text: "Achievement", value: "achievement" },
            { id: "helping-others", text: "Helping others", value: "helping_others" },
            { id: "stability", text: "Stability", value: "stability" },
            { id: "adventure", text: "Adventure", value: "adventure" }
          ],
          validation: {
            required: true,
            minSelected: 1
          }
        }
      ]
    },
    {
      id: "self-reflection",
      title: "Self-Reflection",
      description: "Reflect on your current challenges and aspirations.",
      order: 2,
      questions: [
        {
          id: "main-challenges",
          type: "long_text",
          text: "What are the biggest challenges you're currently facing?",
          placeholder: "Describe your main challenges",
          validation: {
            required: true,
            minLength: 10,
            maxLength: 1200
          }
        },
        {
          id: "personal-achievements",
          type: "long_text",
          text: "What are several things you're proud of achieving?",
          placeholder: "List your proudest achievements",
          validation: {
            required: false,
            minLength: 10,
            maxLength: 1200
          }
        }
      ]
    },
    {
      id: "goals",
      title: "Your Goals and Aspirations",
      description: "Let's explore what you want to achieve.",
      order: 3,
      questions: [
        {
          id: "short-term-goals",
          type: "long_text",
          text: "What are your most important short-term goals? Feel free to list several.",
          placeholder: "E.g., Things to achieve in the next 3-6 months",
          validation: {
            required: true,
            minLength: 10,
            maxLength: 1200
          }
        },
        {
          id: "long-term-goals",
          type: "long_text",
          text: "What are your most important long-term goals? Feel free to list several.",
          placeholder: "E.g., Things to achieve in the next 1-5 years",
          validation: {
            required: true,
            minLength: 10,
            maxLength: 1200
          }
        }
      ]
    },
    {
      id: "strengths",
      title: "Your Strengths",
      description: "Understanding your strengths helps us craft personalized guidance.",
      order: 4,
      questions: [
        {
          id: "top-strengths",
          type: "long_text",
          text: "If people were asked about you, what would they say your top three strengths are?",
          placeholder: "E.g., Determined, Creative, Compassionate",
          validation: {
            required: true,
            minLength: 10,
            maxLength: 1200
          }
        },
        {
          id: "strength-application",
          type: "long_text",
          text: "How have these strengths helped you achieve your goals?",
          placeholder: "Describe how your strengths have shaped your life",
          validation: {
            required: true,
            minLength: 10,
            maxLength: 1200
          }
        }
      ]
    }
  ],
  settings: {
    allowSkipSections: false,
    showProgressBar: true,
    shuffleSections: false,
    completionMessage: "Thank you for completing the onboarding process! We're excited to help you on your journey."
  }
};