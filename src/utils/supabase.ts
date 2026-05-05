import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ─── Case Conversion ──────────────────────────────────────────────────────────

const camelToSnake = (s: string) => s.replace(/([A-Z])/g, c => `_${c.toLowerCase()}`);

const convertKeysToSnake = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(convertKeysToSnake);
  if (obj === null || typeof obj !== 'object') return obj;
  return Object.entries(obj).reduce((acc: any, [k, v]) => {
    acc[camelToSnake(k)] = convertKeysToSnake(v);
    return acc;
  }, {});
};

// ─── Supabase client ──────────────────────────────────────────────────────────

let isConfigured = false;
let rawClient: any;

const buildClient = () => {
  console.log('Building Supabase client...');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'NOT SET');

  if (supabaseUrl && supabaseAnonKey) {
    try {
      rawClient = createClient(supabaseUrl, supabaseAnonKey);
      isConfigured = true;
      console.log('✓ Supabase client initialized successfully');
      return rawClient;
    } catch (error) {
      console.error('Supabase init failed:', error);
      throw new Error('Supabase is required but not available. Please check your environment variables.');
    }
  }
  console.error('Missing Supabase credentials');
  throw new Error('Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
};

const baseSupabase = buildClient();

// ─── Wrapper for case conversion on inserts/updates ────────────────────────────

export const supabase = {
  from: (table: string) => {
    const base = baseSupabase.from(table);
    return {
      select: (query: string) => base.select(query),
      insert: (record: any) => base.insert(convertKeysToSnake(record)),
      update: (updates: any) => ({
        eq: (field: string, value: any) =>
          base.update(convertKeysToSnake(updates)).eq(camelToSnake(field), value),
      }),
      delete: () => ({
        eq: (field: string, value: any) =>
          base.delete().eq(camelToSnake(field), value),
      }),
    };
  },
  auth: baseSupabase.auth,
};

export const isSupabaseAvailable = () => isConfigured;
