import dotenv from 'dotenv';
import { supabaseAdmin } from '../src/lib/supabase/admin';
import { initializeDatabase } from '../src/lib/supabase/schema';

// Load environment variables
dotenv.config();

const init = async () => {
  try {
    console.log('\nChecking database status...');
    const { missingTables, allTablesExist } = await initializeDatabase(supabaseAdmin);

    if (allTablesExist) {
      console.log('\n✅ Database setup is complete. All required tables exist.');
    } else {
      console.log('\n⚠️  Some tables are missing:', missingTables.join(', '));
      console.log('\nTo complete setup:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Open src/lib/supabase/migrations/00001_initial_schema.sql');
      console.log('4. Copy and run the SQL commands');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database setup check failed:', error);
    process.exit(1);
  }
};

init();