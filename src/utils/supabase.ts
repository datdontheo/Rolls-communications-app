import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ─── Case Conversion ──────────────────────────────────────────────────────────

const camelToSnake = (s: string) => s.replace(/([A-Z])/g, c => `_${c.toLowerCase()}`);
const snakeToCamel = (s: string) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

export const convertKeysToSnake = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(convertKeysToSnake);
  if (obj === null || typeof obj !== 'object') return obj;
  return Object.entries(obj).reduce((acc: any, [k, v]) => {
    acc[camelToSnake(k)] = convertKeysToSnake(v);
    return acc;
  }, {});
};

export const convertKeysToCamel = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(convertKeysToCamel);
  if (obj === null || typeof obj !== 'object') return obj;
  return Object.entries(obj).reduce((acc: any, [k, v]) => {
    acc[snakeToCamel(k)] = convertKeysToCamel(v);
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

// ─── Helper to run a query and convert keys ───────────────────────────────────

async function runSelect(q: any): Promise<{ data: any; error: any }> {
  const { data, error } = await q;
  return { data: convertKeysToCamel(data), error };
}

async function runSelectSingle(q: any): Promise<{ data: any; error: any }> {
  const { data, error } = await q.single();
  return { data: convertKeysToCamel(data), error };
}

// ─── Wrapper with full camelCase ↔ snake_case conversion ─────────────────────

export const supabase = {
  from: (table: string) => {
    const base = baseSupabase.from(table);
    return {
      select: (query: string) => {
        const q = base.select(query);
        return {
          run: () => runSelect(q),
          single: () => runSelectSingle(q),
          eq: (field: string, value: any) => {
            const filtered = q.eq(camelToSnake(field), value);
            return {
              run: () => runSelect(filtered),
              single: () => runSelectSingle(filtered),
            };
          },
        };
      },
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
