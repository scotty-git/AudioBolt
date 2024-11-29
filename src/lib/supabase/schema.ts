import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types/database';

export const initializeDatabase = async (supabase: SupabaseClient<Database>) => {
  try {
    const tables = ['users', 'onboarding_submissions', 'questionnaire_submissions'];
    const results = await Promise.all(
      tables.map(async (table) => {
        const { error } = await supabase
          .from(table)
          .select('id')
          .limit(1);
        
        return { table, exists: !error || error.code !== '42P01' };
      })
    );

    const missingTables = results.filter(r => !r.exists).map(r => r.table);
    const allTablesExist = missingTables.length === 0;

    return { missingTables, allTablesExist };
  } catch (error) {
    console.error('Error checking database tables:', error);
    throw error;
  }
};