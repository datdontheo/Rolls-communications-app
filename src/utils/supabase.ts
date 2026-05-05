import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Check if Supabase is available (for fallback to localStorage)
export async function isSupabaseAvailable(): Promise<boolean> {
  try {
    await supabase.auth.getSession();
    return true;
  } catch {
    return false;
  }
}
