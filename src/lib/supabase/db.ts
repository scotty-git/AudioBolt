import { createClient } from '@supabase/supabase-js';
import { initializeDatabase } from './schema';

if (!import.meta.env.VITE_SUPABASE_URL) {
  throw new Error('Missing environment variable: VITE_SUPABASE_URL');
}

if (!import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing environment variable: VITE_SUPABASE_SERVICE_ROLE_KEY');
}

const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false
    }
  }
);

export const setupDatabase = async () => {
  try {
    await initializeDatabase(supabaseAdmin);
    console.log('\nIMPORTANT: To create the database tables:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy the contents of src/lib/supabase/migrations/00001_initial_schema.sql');
    console.log('4. Paste and run the SQL in the editor\n');
  } catch (error) {
    console.error('Failed to check database status:', error);
    throw error;
  }
};