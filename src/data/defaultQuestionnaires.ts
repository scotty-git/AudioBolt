import { v4 as uuidv4 } from 'uuid';

export const generalSelfHelpQuestionnaire = {
  id: "general-self-help",
  title: "General Self-Help Assessment",
  description: "Create a personalized daily motivational audiobook to help you feel positive and focused on your goals.",
  version: "1.0.0",
  type: "questionnaire" as const,
  isDefault: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  sections: [
    {
      id: "goals",
      title: "Your Goals and Aspirations",
      description: "Help us understand your top priorities and motivations.",
      order: 0,
      questions: [
        {
          id: "top-goals",
          type: "long_text",
          text: "What are your top three goals in life right now?",
          placeholder: "Describe your goals",
          validation: {
            required: true,
            minLength: 10,
            maxLength: 300
          }
        },
        {
          id: "success-definition",
          type: "text",
          text: "What does success look like for you in one year?",
          placeholder: "Describe your vision of success",
          validation: {
            required: true,
            maxLength: 150
          }
        },
        {
          id: "challenge",
          type: "text",
          text: "What is one challenge that holds you back?",
          placeholder: "Describe a challenge",
          validation: {
            required: false
          }
        }
      ]
    },
    {
      id: "values",
      title: "Your Values and Strengths",
      description: "Help us understand what drives you and makes you confident.",
      order: 1,
      questions: [
        {
          id: "guiding-principles",
          type: "long_text",
          text: "What values or principles guide your decisions?",
          placeholder: "Describe your guiding principles",
          validation: {
            required: true,
            minLength: 10,
            maxLength: 300
          }
        },
        {
          id: "motivators",
          type: "checkbox",
          text: "What motivates you the most? (Select all that apply)",
          options: [
            { id: "recognition", text: "Recognition", value: "recognition" },
            { id: "helping-others", text: "Helping others", value: "helping_others" },
            { id: "achievement", text: "Personal achievement", value: "achievement" },
            { id: "adventure", text: "Adventure", value: "adventure" }
          ],
          validation: {
            required: true,
            minSelected: 1
          }
        }
      ]
    }
  ],
  settings: {
    allowSkipSections: true,
    showProgressBar: true,
    shuffleSections: false,
    completionMessage: "Thank you for sharing your goals with us!"
  }
};

export const sleepQuestionnaire = {
  id: "sleep-focused",
  title: "Sleep-Focused Assessment",
  description: "Help us understand your sleep patterns and create better sleep habits.",
  version: "1.0.0",
  type: "questionnaire" as const,
  isDefault: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  sections: [
    {
      id: "sleep-challenges",
      title: "Sleep Challenges",
      description: "Let's understand what's affecting your sleep quality.",
      order: 0,
      questions: [
        {
          id: "main-challenge",
          type: "long_text",
          text: "What's your biggest challenge when trying to sleep?",
          placeholder: "Describe your main sleep challenge",
          validation: {
            required: true,
            minLength: 10,
            maxLength: 500
          }
        },
        {
          id: "wakeup-frequency",
          type: "slider",
          text: "How often do you wake up during the night?",
          validation: {
            required: true,
            minValue: 0,
            maxValue: 10,
            step: 1
          }
        }
      ]
    },
    {
      id: "sleep-habits",
      title: "Sleep Habits & Preferences",
      description: "Tell us about your sleep routine and what helps you rest.",
      order: 1,
      questions: [
        {
          id: "bedtime-routine",
          type: "checkbox",
          text: "What helps you feel calm at night? (Select all that apply)",
          options: [
            { id: "meditation", text: "Meditation", value: "meditation" },
            { id: "reading", text: "Reading", value: "reading" },
            { id: "music", text: "Listening to Music", value: "music" },
            { id: "breathing", text: "Deep Breathing Exercises", value: "breathing" }
          ],
          validation: {
            required: true,
            minSelected: 1
          }
        },
        {
          id: "sleep-schedule",
          type: "radio",
          text: "What's your typical bedtime?",
          options: [
            { id: "early", text: "Before 10 PM", value: "before_10pm" },
            { id: "medium", text: "10 PM - 12 AM", value: "10pm_12am" },
            { id: "late", text: "After 12 AM", value: "after_12am" }
          ],
          validation: {
            required: true
          }
        }
      ]
    }
  ],
  settings: {
    allowSkipSections: false,
    showProgressBar: true,
    shuffleSections: false,
    completionMessage: "Thank you for sharing your sleep habits with us!"
  }
};

export const fitnessQuestionnaire = {
  id: "fitness-assessment",
  title: "Fitness & Wellness Assessment",
  description: "Help us understand your fitness goals and create a personalized wellness plan.",
  version: "1.0.0",
  type: "questionnaire" as const,
  isDefault: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  sections: [
    {
      id: "fitness-goals",
      title: "Fitness Goals",
      description: "Tell us about your fitness aspirations.",
      order: 0,
      questions: [
        {
          id: "primary-goal",
          type: "radio",
          text: "What is your primary fitness goal?",
          options: [
            { id: "weight-loss", text: "Weight Loss", value: "weight_loss" },
            { id: "muscle-gain", text: "Muscle Gain", value: "muscle_gain" },
            { id: "endurance", text: "Improve Endurance", value: "endurance" },
            { id: "flexibility", text: "Increase Flexibility", value: "flexibility" }
          ],
          validation: {
            required: true
          }
        },
        {
          id: "commitment",
          type: "slider",
          text: "How many hours per week can you dedicate to exercise?",
          validation: {
            required: true,
            minValue: 1,
            maxValue: 20,
            step: 1
          }
        }
      ]
    },
    {
      id: "current-habits",
      title: "Current Habits",
      description: "Tell us about your current fitness routine.",
      order: 1,
      questions: [
        {
          id: "exercise-preference",
          type: "checkbox",
          text: "What types of exercise do you enjoy? (Select all that apply)",
          options: [
            { id: "cardio", text: "Cardio", value: "cardio" },
            { id: "weights", text: "Weight Training", value: "weights" },
            { id: "yoga", text: "Yoga/Pilates", value: "yoga" },
            { id: "sports", text: "Sports", value: "sports" }
          ],
          validation: {
            required: true,
            minSelected: 1
          }
        },
        {
          id: "challenges",
          type: "long_text",
          text: "What challenges do you face in maintaining a fitness routine?",
          placeholder: "Describe your challenges",
          validation: {
            required: true,
            minLength: 10,
            maxLength: 500
          }
        }
      ]
    }
  ],
  settings: {
    allowSkipSections: false,
    showProgressBar: true,
    shuffleSections: false,
    completionMessage: "Thank you for sharing your fitness goals with us!"
  }
};

export const weightLossQuestionnaire = {
  id: "weight-loss-assessment",
  title: "Weight Loss Journey Assessment",
  description: "Help us understand your weight loss goals and create a sustainable plan.",
  version: "1.0.0",
  type: "questionnaire" as const,
  isDefault: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  sections: [
    {
      id: "goals-timeline",
      title: "Goals & Timeline",
      description: "Let's understand your weight loss objectives.",
      order: 0,
      questions: [
        {
          id: "target-weight",
          type: "text",
          text: "What is your target weight goal?",
          placeholder: "Enter target weight in pounds/kilos",
          validation: {
            required: true
          }
        },
        {
          id: "timeline",
          type: "radio",
          text: "What is your desired timeline for reaching this goal?",
          options: [
            { id: "3months", text: "3 months", value: "3_months" },
            { id: "6months", text: "6 months", value: "6_months" },
            { id: "1year", text: "1 year", value: "1_year" }
          ],
          validation: {
            required: true
          }
        }
      ]
    },
    {
      id: "lifestyle",
      title: "Lifestyle & Habits",
      description: "Tell us about your current lifestyle.",
      order: 1,
      questions: [
        {
          id: "diet-preferences",
          type: "checkbox",
          text: "What dietary preferences do you have? (Select all that apply)",
          options: [
            { id: "vegetarian", text: "Vegetarian", value: "vegetarian" },
            { id: "vegan", text: "Vegan", value: "vegan" },
            { id: "keto", text: "Keto", value: "keto" },
            { id: "paleo", text: "Paleo", value: "paleo" },
            { id: "none", text: "No specific diet", value: "none" }
          ],
          validation: {
            required: true,
            minSelected: 1
          }
        },
        {
          id: "challenges",
          type: "long_text",
          text: "What are your biggest challenges with weight loss?",
          placeholder: "Describe your challenges",
          validation: {
            required: true,
            minLength: 10,
            maxLength: 500
          }
        }
      ]
    }
  ],
  settings: {
    allowSkipSections: false,
    showProgressBar: true,
    shuffleSections: false,
    completionMessage: "Thank you for sharing your weight loss journey with us!"
  }
};

// Export all questionnaires
export const defaultQuestionnaires = [
  generalSelfHelpQuestionnaire,
  sleepQuestionnaire,
  fitnessQuestionnaire,
  weightLossQuestionnaire
];