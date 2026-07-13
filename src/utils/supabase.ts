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

// Build the client lazily and NEVER throw at import time — a throw here would
// prevent the whole app from mounting (white screen) before any error UI can
// render. If credentials are missing we degrade gracefully: every query resolves
// to a clear error, which the data store surfaces to the user via a banner.
const NOT_CONFIGURED_ERROR = {
  message: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
};

let baseSupabase: any = null;
let isConfigured = false;

if (supabaseUrl && supabaseAnonKey) {
  try {
    baseSupabase = createClient(supabaseUrl, supabaseAnonKey);
    isConfigured = true;
  } catch (error) {
    console.error('Supabase init failed:', error);
  }
}

// ─── Helper to run a query and convert keys ───────────────────────────────────

async function runSelect(q: any): Promise<{ data: any; error: any }> {
  const { data, error } = await q;
  return { data: convertKeysToCamel(data), error };
}

async function runSelectSingle(q: any): Promise<{ data: any; error: any }> {
  const { data, error } = await q.single();
  return { data: convertKeysToCamel(data), error };
}

// Returned for every operation when Supabase isn't configured so callers get a
// consistent `{ error }` instead of a thrown exception.
const notConfigured = { data: null, error: NOT_CONFIGURED_ERROR };
const unconfiguredTable = {
  select: () => ({
    run: async () => notConfigured,
    single: async () => notConfigured,
    eq: () => ({ run: async () => notConfigured, single: async () => notConfigured }),
  }),
  insert: async () => notConfigured,
  upsert: async () => notConfigured,
  update: () => ({ eq: async () => notConfigured }),
  delete: () => ({ eq: async () => notConfigured }),
};

// ─── Wrapper with full camelCase ↔ snake_case conversion ─────────────────────

export const supabase = {
  from: (table: string) => {
    if (!isConfigured) return unconfiguredTable;
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
      upsert: (record: any) => base.upsert(convertKeysToSnake(record)),
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
  auth: baseSupabase?.auth,
};

export const isSupabaseAvailable = () => isConfigured;
