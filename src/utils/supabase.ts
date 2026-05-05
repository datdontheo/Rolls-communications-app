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

// ─── localStorage fallback ────────────────────────────────────────────────────

type SelectResult = Promise<{ data: any; error: any }> & {
  single: () => Promise<{ data: any; error: any }>;
};

const createSelectQuery = (table: string): SelectResult => {
  const p: any = Promise.resolve().then(() => {
    try {
      const data = JSON.parse(localStorage.getItem(table) || '[]');
      return { data, error: null };
    } catch (e) {
      return { data: null, error: e };
    }
  });

  p.single = async () => {
    try {
      const data = JSON.parse(localStorage.getItem(table) || 'null');
      return { data, error: null };
    } catch (e) {
      return { data: null, error: e };
    }
  };

  return p as SelectResult;
};

class LocalStorageClient {
  from(table: string) {
    return {
      select: (_query: string) => createSelectQuery(table),
      insert: async (record: any) => {
        try {
          const data = JSON.parse(localStorage.getItem(table) || '[]');
          data.push(record);
          localStorage.setItem(table, JSON.stringify(data));
          return { data: [record], error: null };
        } catch (e) {
          return { data: null, error: e };
        }
      },
      update: (updates: any) => ({
        eq: async (field: string, value: any) => {
          try {
            const data = JSON.parse(localStorage.getItem(table) || '[]');
            const index = data.findIndex((item: any) => item[field] === value);
            if (index !== -1) {
              data[index] = { ...data[index], ...updates };
              localStorage.setItem(table, JSON.stringify(data));
            }
            return { data: null, error: null };
          } catch (e) {
            return { data: null, error: e };
          }
        },
      }),
      delete: () => ({
        eq: async (field: string, value: any) => {
          try {
            let data = JSON.parse(localStorage.getItem(table) || '[]');
            data = data.filter((item: any) => item[field] !== value);
            localStorage.setItem(table, JSON.stringify(data));
            return { data: null, error: null };
          } catch (e) {
            return { data: null, error: e };
          }
        },
      }),
    };
  }
  auth = { getSession: async () => ({ data: null, error: null }) };
}

// ─── Export ───────────────────────────────────────────────────────────────────

let isConfigured = false;

const buildClient = () => {
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const raw = createClient(supabaseUrl, supabaseAnonKey);
      isConfigured = true;
      return wrapSupabase(raw);
    } catch {
      console.warn('Supabase init failed — using localStorage');
    }
  }
  return new LocalStorageClient();
};

export const supabase = buildClient();

export const isSupabaseAvailable = () => isConfigured;
