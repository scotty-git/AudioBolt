export const navigationConfig = {
  menuItems: [
    {
      label: 'Onboarding',
      path: '/onboarding',
      submenu: [
        { label: 'Onboarding Builder', path: '/onboarding/builder' },
        { label: 'User Onboarding', path: '/onboarding/user' },
      ],
    },
    {
      label: 'Questionnaires',
      path: '/questionnaires',
      submenu: [
        { label: 'Questionnaire Builder', path: '/questionnaires/builder' },
        { label: 'Fill Questionnaire', path: '/questionnaires/user' },
      ],
    },
    {
      label: 'Templates',
      path: '/templates',
    },
    {
      label: 'Submissions',
      path: '/submissions',
    },
  ],
};