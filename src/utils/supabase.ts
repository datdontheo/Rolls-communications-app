import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let isConfigured = false;

const buildClient = () => {
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const client = createClient(supabaseUrl, supabaseAnonKey);
      isConfigured = true;
      return client;
    } catch (error) {
      console.error('Supabase init failed:', error);
      throw new Error('Supabase is required but not available. Please check your environment variables.');
    }
  }
  throw new Error('Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
};

export const supabase = buildClient();

export const isSupabaseAvailable = () => isConfigured;
