import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from '../src/lib/supabase/config';

console.log('\nChecking Supabase configuration...\n');
console.log('SUPABASE_URL:', SUPABASE_URL);
console.log('ANON_KEY:', SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing');
console.log('SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✓ Set' : '✗ Missing');