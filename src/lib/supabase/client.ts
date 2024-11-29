import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';
import type { Database } from './types/database';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);