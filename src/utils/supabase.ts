import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ─── Case Conversion Utilities ────────────────────────────────────────────────

const snakeToCamel = (s: string) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
const camelToSnake = (s: string) => s.replace(/([A-Z])/g, c => `_${c.toLowerCase()}`);

const fromDb = (record: any): any => {
  if (Array.isArray(record)) return record.map(fromDb);
  if (record === null || typeof record !== 'object') return record;
  return Object.entries(record).reduce((acc: any, [k, v]) => {
    acc[snakeToCamel(k)] = fromDb(v);
    return acc;
  }, {});
};

const toDb = (record: any): any => {
  if (Array.isArray(record)) return record.map(toDb);
  if (record === null || typeof record !== 'object') return record;
  return Object.entries(record).reduce((acc: any, [k, v]) => {
    acc[camelToSnake(k)] = toDb(v);
    return acc;
  }, {});
};

// ─── Supabase wrapper (real) ──────────────────────────────────────────────────

const wrapSupabase = (client: any) => ({
  from: (table: string) => ({
    select: (_query: string): SelectResult => {
      const q = client.from(table).select(_query);
      const p: any = q.then(({ data, error }: any) => ({
        data: data ? fromDb(data) : null,
        error,
      }));
      p.single = async () => {
        const { data, error } = await q.single();
        return { data: data ? fromDb(data) : null, error };
      };
      return p as SelectResult;
    },
    insert: async (record: any) => {
      const { data, error } = await client.from(table).insert(toDb(record));
      return { data, error };
    },
    update: (updates: any) => ({
      eq: async (field: string, value: any) => {
        const { data, error } = await client.from(table).update(toDb(updates)).eq(camelToSnake(field), value);
        return { data, error };
      },
    }),
    delete: () => ({
      eq: async (field: string, value: any) => {
        const { data, error } = await client.from(table).delete().eq(camelToSnake(field), value);
        return { data, error };
      },
    }),
  }),
  auth: client.auth,
});

// ─── Export ───────────────────────────────────────────────────────────────────

let isConfigured = false;

const buildClient = () => {
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const raw = createClient(supabaseUrl, supabaseAnonKey);
      isConfigured = true;
      return wrapSupabase(raw);
    } catch (error) {
      console.error('Supabase init failed:', error);
      throw new Error('Supabase is required but not available. Please check your environment variables.');
    }
  }
  throw new Error('Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
};

export const supabase = buildClient();

export const isSupabaseAvailable = () => isConfigured;
