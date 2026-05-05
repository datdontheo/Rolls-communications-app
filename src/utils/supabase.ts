import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let realSupabase: any = null;
let isConfigured = false;

if (supabaseUrl && supabaseAnonKey) {
  try {
    realSupabase = createClient(supabaseUrl, supabaseAnonKey);
    isConfigured = true;
  } catch {
    console.warn('Failed to initialize Supabase, will use localStorage');
  }
}

// Fallback Supabase-like interface for localStorage
class LocalStorageClient {
  from(table: string) {
    return {
      select: (query: string) => ({
        single: async () => {
          try {
            const data = JSON.parse(localStorage.getItem(table) || 'null');
            return { data, error: null };
          } catch (e) {
            return { data: null, error: e };
          }
        },
        then: async function(callback: any) {
          try {
            const data = JSON.parse(localStorage.getItem(table) || '[]');
            return callback({ data, error: null });
          } catch (e) {
            return callback({ data: null, error: e });
          }
        }
      }),
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
  auth = {
    getSession: async () => ({ data: null, error: null }),
  };
}

export const supabase = isConfigured ? realSupabase : new LocalStorageClient();

export async function isSupabaseAvailable(): Promise<boolean> {
  return isConfigured;
}
