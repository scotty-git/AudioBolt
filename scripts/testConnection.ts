import { supabaseAdmin } from '../src/lib/supabase/admin';

const testConnection = async () => {
  try {
    console.log('\nTesting Supabase connection...');
    
    const { data, error } = await supabaseAdmin.from('users').select('*').limit(1);
    
    if (error) throw error;

    console.log('\n✅ Successfully connected to Supabase!');
    console.log('Connection test passed');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database connection test failed:', error);
    process.exit(1);
  }
};

testConnection();