import { create } from 'zustand';
import type {
  Client,
  Invoice,
  Quotation,
  Job,
  IncomeEntry,
  ExpenseEntry,
  StockItem,
  CompanySettings,
} from '../types';
import { generateInvoiceNumber, generateJobId, generateQuoteNumber } from '../utils/generators';
import { supabase } from '../utils/supabase';

interface DataState {
  // Loading state
  isLoading: boolean;
  error: string | null;

  // Company Settings
  settings: CompanySettings;
  updateSettings: (settings: Partial<CompanySettings>) => Promise<void>;
  loadSettings: () => Promise<void>;

  // Clients
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<void>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClient: (id: string) => Client | undefined;
  loadClients: () => Promise<void>;

  // Invoices
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  getInvoice: (id: string) => Invoice | undefined;
  loadInvoices: () => Promise<void>;

  // Quotations
  quotations: Quotation[];
  addQuotation: (quotation: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateQuotation: (id: string, quotation: Partial<Quotation>) => Promise<void>;
  deleteQuotation: (id: string) => Promise<void>;
  getQuotation: (id: string) => Quotation | undefined;
  loadQuotations: () => Promise<void>;

  // Jobs
  jobs: Job[];
  addJob: (job: Omit<Job, 'id' | 'jobId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateJob: (id: string, job: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  getJob: (id: string) => Job | undefined;
  loadJobs: () => Promise<void>;

  // Income
  income: IncomeEntry[];
  addIncomeEntry: (entry: Omit<IncomeEntry, 'id' | 'createdAt'>) => Promise<void>;
  deleteIncomeEntry: (id: string) => Promise<void>;
  loadIncome: () => Promise<void>;

  // Expenses
  expenses: ExpenseEntry[];
  addExpenseEntry: (entry: Omit<ExpenseEntry, 'id' | 'createdAt'>) => Promise<void>;
  deleteExpenseEntry: (id: string) => Promise<void>;
  loadExpenses: () => Promise<void>;

  // Stock
  stock: StockItem[];
  addStockItem: (item: Omit<StockItem, 'id' | 'createdAt'>) => Promise<void>;
  updateStockItem: (id: string, item: Partial<StockItem>) => Promise<void>;
  deleteStockItem: (id: string) => Promise<void>;
  loadStock: () => Promise<void>;

  // Load all data from Supabase
  loadAllData: () => Promise<void>;
}

const DEFAULT_SETTINGS: CompanySettings = {
  companyName: 'Rolls Communications',
  logo: '',
  address: 'Teshie, Accra',
  poBox: 'P.O. Box 108 Teshie Accra',
  phone: ['020 745 6947', '024 569 1630'],
  emails: ['tlaryea_rollscomm@live.com', 'akena_rollscomm@live.com'],
  website: 'www.rollscommunications.com.gh',
  vatRate: 20,
  currency: 'GHS',
  invoicePrefix: 'RC',
  monthlyRevenueTarget: 10000,
};

export const useDataStore = create<DataState>((set, get) => ({
  isLoading: false,
  error: null,

  settings: DEFAULT_SETTINGS,

  // ─── Settings ────
  loadSettings: async () => {
    try {
      const { data, error } = await supabase.from('company_settings').select('*').single();
      if (error) throw error;
      if (data) set({ settings: data as CompanySettings });
    } catch (err) {
      console.error('Failed to load settings:', err);
      set({ error: 'Failed to load settings' });
    }
  },

  updateSettings: async (newSettings) => {
    try {
      const { error } = await supabase
        .from('company_settings')
        .update(newSettings)
        .eq('id', 'settings');
      if (error) {
        console.error('Supabase update error:', error);
        throw new Error(`Supabase error: ${error.message || JSON.stringify(error)}`);
      }
      set((state) => ({ settings: { ...state.settings, ...newSettings } }));
    } catch (err) {
      console.error('Failed to update settings:', err);
      set({ error: 'Failed to update settings' });
      throw err;
    }
  },

  // ─── Clients ────
  clients: [],
  loadClients: async () => {
    try {
      const { data, error } = await supabase.from('clients').select('*');
      if (error) throw error;
      set({ clients: data || [] });
    } catch (err) {
      console.error('Failed to load clients:', err);
      set({ error: 'Failed to load clients' });
    }
  },

  addClient: async (client) => {
    try {
      const id = Math.random().toString(36).substr(2, 9);
      const createdAt = new Date().toISOString();
      const { error } = await supabase.from('clients').insert({
        ...client,
        id,
        createdAt,
      });
      if (error) throw error;
      set((state) => ({ clients: [...state.clients, { ...client, id, createdAt }] }));
    } catch (err) {
      console.error('Failed to add client:', err);
      throw err;
    }
  },

  updateClient: async (id, client) => {
    try {
      const { error } = await supabase.from('clients').update(client).eq('id', id);
      if (error) throw error;
      set((state) => ({
        clients: state.clients.map((c) => (c.id === id ? { ...c, ...client } : c)),
      }));
    } catch (err) {
      console.error('Failed to update client:', err);
      throw err;
    }
  },

  deleteClient: async (id) => {
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ clients: state.clients.filter((c) => c.id !== id) }));
    } catch (err) {
      console.error('Failed to delete client:', err);
      throw err;
    }
  },

  getClient: (id) => get().clients.find((c) => c.id === id),

  // ─── Invoices ────
  invoices: [],
  loadInvoices: async () => {
    try {
      const { data, error } = await supabase.from('invoices').select('*');
      if (error) throw error;
      set({ invoices: data || [] });
    } catch (err) {
      console.error('Failed to load invoices:', err);
      set({ error: 'Failed to load invoices' });
    }
  },

  addInvoice: async (invoice) => {
    try {
      const id = Math.random().toString(36).substr(2, 9);
      const number = invoice.number || generateInvoiceNumber(get().settings.invoicePrefix);
      const now = new Date().toISOString();
      const { error } = await supabase.from('invoices').insert({
        ...invoice,
        id,
        number,
        createdAt: now,
        updatedAt: now,
      });
      if (error) throw error;
      set((state) => ({
        invoices: [...state.invoices, { ...invoice, id, number, createdAt: now, updatedAt: now }],
      }));
    } catch (err) {
      console.error('Failed to add invoice:', err);
      throw err;
    }
  },

  updateInvoice: async (id, invoice) => {
    try {
      const updatedAt = new Date().toISOString();
      const { error } = await supabase
        .from('invoices')
        .update({ ...invoice, updatedAt })
        .eq('id', id);
      if (error) throw error;
      set((state) => ({
        invoices: state.invoices.map((inv) =>
          inv.id === id ? { ...inv, ...invoice, updatedAt: new Date().toISOString() } : inv
        ),
      }));
    } catch (err) {
      console.error('Failed to update invoice:', err);
      throw err;
    }
  },

  deleteInvoice: async (id) => {
    try {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ invoices: state.invoices.filter((inv) => inv.id !== id) }));
    } catch (err) {
      console.error('Failed to delete invoice:', err);
      throw err;
    }
  },

  getInvoice: (id) => get().invoices.find((inv) => inv.id === id),

  // ─── Quotations ────
  quotations: [],
  loadQuotations: async () => {
    try {
      const { data, error } = await supabase.from('quotations').select('*');
      if (error) throw error;
      set({ quotations: data || [] });
    } catch (err) {
      console.error('Failed to load quotations:', err);
      set({ error: 'Failed to load quotations' });
    }
  },

  addQuotation: async (quotation) => {
    try {
      const id = Math.random().toString(36).substr(2, 9);
      const number = quotation.number || generateQuoteNumber(get().settings.invoicePrefix);
      const now = new Date().toISOString();
      const { error } = await supabase.from('quotations').insert({
        ...quotation,
        id,
        number,
        createdAt: now,
        updatedAt: now,
      });
      if (error) throw error;
      set((state) => ({
        quotations: [...state.quotations, { ...quotation, id, number, createdAt: now, updatedAt: now }],
      }));
    } catch (err) {
      console.error('Failed to add quotation:', err);
      throw err;
    }
  },

  updateQuotation: async (id, quotation) => {
    try {
      const updatedAt = new Date().toISOString();
      const { error } = await supabase
        .from('quotations')
        .update({ ...quotation, updatedAt })
        .eq('id', id);
      if (error) throw error;
      set((state) => ({
        quotations: state.quotations.map((q) =>
          q.id === id ? { ...q, ...quotation, updatedAt: new Date().toISOString() } : q
        ),
      }));
    } catch (err) {
      console.error('Failed to update quotation:', err);
      throw err;
    }
  },

  deleteQuotation: async (id) => {
    try {
      const { error } = await supabase.from('quotations').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ quotations: state.quotations.filter((q) => q.id !== id) }));
    } catch (err) {
      console.error('Failed to delete quotation:', err);
      throw err;
    }
  },

  getQuotation: (id) => get().quotations.find((q) => q.id === id),

  // ─── Jobs ────
  jobs: [],
  loadJobs: async () => {
    try {
      const { data, error } = await supabase.from('jobs').select('*');
      if (error) throw error;
      set({ jobs: data || [] });
    } catch (err) {
      console.error('Failed to load jobs:', err);
      set({ error: 'Failed to load jobs' });
    }
  },

  addJob: async (job) => {
    try {
      const id = Math.random().toString(36).substr(2, 9);
      const jobId = generateJobId();
      const now = new Date().toISOString();
      const { error } = await supabase.from('jobs').insert({
        ...job,
        id,
        jobId,
        createdAt: now,
        updatedAt: now,
      });
      if (error) throw error;
      set((state) => ({ jobs: [...state.jobs, { ...job, id, jobId, createdAt: now, updatedAt: now }] }));
    } catch (err) {
      console.error('Failed to add job:', err);
      throw err;
    }
  },

  updateJob: async (id, job) => {
    try {
      const updatedAt = new Date().toISOString();
      const { error } = await supabase
        .from('jobs')
        .update({ ...job, updatedAt })
        .eq('id', id);
      if (error) throw error;
      set((state) => ({
        jobs: state.jobs.map((j) =>
          j.id === id ? { ...j, ...job, updatedAt: new Date().toISOString() } : j
        ),
      }));
    } catch (err) {
      console.error('Failed to update job:', err);
      throw err;
    }
  },

  deleteJob: async (id) => {
    try {
      const { error } = await supabase.from('jobs').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ jobs: state.jobs.filter((j) => j.id !== id) }));
    } catch (err) {
      console.error('Failed to delete job:', err);
      throw err;
    }
  },

  getJob: (id) => get().jobs.find((j) => j.id === id),

  // ─── Income ────
  income: [],
  loadIncome: async () => {
    try {
      const { data, error } = await supabase.from('income_entries').select('*');
      if (error) throw error;
      set({ income: data || [] });
    } catch (err) {
      console.error('Failed to load income:', err);
      set({ error: 'Failed to load income' });
    }
  },

  addIncomeEntry: async (entry) => {
    try {
      const id = Math.random().toString(36).substr(2, 9);
      const createdAt = new Date().toISOString();
      const { error } = await supabase.from('income_entries').insert({
        ...entry,
        id,
        createdAt,
      });
      if (error) throw error;
      set((state) => ({
        income: [...state.income, { ...entry, id, createdAt }],
      }));
    } catch (err) {
      console.error('Failed to add income entry:', err);
      throw err;
    }
  },

  deleteIncomeEntry: async (id) => {
    try {
      const { error } = await supabase.from('income_entries').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ income: state.income.filter((e) => e.id !== id) }));
    } catch (err) {
      console.error('Failed to delete income entry:', err);
      throw err;
    }
  },

  // ─── Expenses ────
  expenses: [],
  loadExpenses: async () => {
    try {
      const { data, error } = await supabase.from('expense_entries').select('*');
      if (error) throw error;
      set({ expenses: data || [] });
    } catch (err) {
      console.error('Failed to load expenses:', err);
      set({ error: 'Failed to load expenses' });
    }
  },

  addExpenseEntry: async (entry) => {
    try {
      const id = Math.random().toString(36).substr(2, 9);
      const createdAt = new Date().toISOString();
      const { error } = await supabase.from('expense_entries').insert({
        ...entry,
        id,
        createdAt,
      });
      if (error) throw error;
      set((state) => ({
        expenses: [...state.expenses, { ...entry, id, createdAt }],
      }));
    } catch (err) {
      console.error('Failed to add expense entry:', err);
      throw err;
    }
  },

  deleteExpenseEntry: async (id) => {
    try {
      const { error } = await supabase.from('expense_entries').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) }));
    } catch (err) {
      console.error('Failed to delete expense entry:', err);
      throw err;
    }
  },

  // ─── Stock ────
  stock: [],
  loadStock: async () => {
    try {
      const { data, error } = await supabase.from('stock_items').select('*');
      if (error) throw error;
      set({ stock: data || [] });
    } catch (err) {
      console.error('Failed to load stock:', err);
      set({ error: 'Failed to load stock' });
    }
  },

  addStockItem: async (item) => {
    try {
      const id = Math.random().toString(36).substr(2, 9);
      const createdAt = new Date().toISOString();
      const { error } = await supabase.from('stock_items').insert({
        ...item,
        id,
        createdAt,
      });
      if (error) throw error;
      set((state) => ({
        stock: [...state.stock, { ...item, id, createdAt }],
      }));
    } catch (err) {
      console.error('Failed to add stock item:', err);
      throw err;
    }
  },

  updateStockItem: async (id, item) => {
    try {
      const { error } = await supabase.from('stock_items').update(item).eq('id', id);
      if (error) throw error;
      set((state) => ({
        stock: state.stock.map((s) => (s.id === id ? { ...s, ...item } : s)),
      }));
    } catch (err) {
      console.error('Failed to update stock item:', err);
      throw err;
    }
  },

  deleteStockItem: async (id) => {
    try {
      const { error } = await supabase.from('stock_items').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ stock: state.stock.filter((s) => s.id !== id) }));
    } catch (err) {
      console.error('Failed to delete stock item:', err);
      throw err;
    }
  },

  // ─── Bulk Load ────
  loadAllData: async () => {
    set({ isLoading: true, error: null });
    try {
      await Promise.all([
        get().loadSettings(),
        get().loadClients(),
        get().loadInvoices(),
        get().loadQuotations(),
        get().loadJobs(),
        get().loadIncome(),
        get().loadExpenses(),
        get().loadStock(),
      ]);
    } catch (err) {
      console.error('Failed to load all data:', err);
      set({ error: 'Failed to load data from database' });
    } finally {
      set({ isLoading: false });
    }
  },
}));
