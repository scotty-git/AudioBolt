import { initializeDatabase } from '../src/db/client';

const init = async () => {
  try {
    console.log('\nInitializing IndexedDB...');
    await initializeDatabase();
    console.log('✅ IndexedDB setup complete');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ IndexedDB setup failed:', error);
    process.exit(1);
  }
};

init();