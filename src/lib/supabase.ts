import { createClient } from '@supabase/supabase-js';
import { type Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or Publishable Key in environment variables')
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseKey
);