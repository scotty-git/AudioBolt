import { cleanupTemplates } from '../src/utils/cleanup.js';

const cleanup = async () => {
  try {
    const result = await cleanupTemplates();
    console.log('Cleanup completed successfully:', result);
    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
};

cleanup();