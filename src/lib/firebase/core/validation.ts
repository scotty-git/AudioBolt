export const validateConfig = (config: Record<string, string | undefined>) => {
  const requiredEnvVars = [
    'apiKey',
    'projectId',
    'messagingSenderId',
    'appId',
  ];

  const missingVars = requiredEnvVars.filter(key => !config[key]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Firebase configuration:\n${missingVars.join('\n')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
};