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

interface DataState {
  // Company Settings
  settings: CompanySettings;
  updateSettings: (settings: Partial<CompanySettings>) => void;

  // Clients
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClient: (id: string) => Client | undefined;

  // Invoices
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  getInvoice: (id: string) => Invoice | undefined;

  // Quotations
  quotations: Quotation[];
  addQuotation: (quotation: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateQuotation: (id: string, quotation: Partial<Quotation>) => void;
  deleteQuotation: (id: string) => void;
  getQuotation: (id: string) => Quotation | undefined;

  // Jobs
  jobs: Job[];
  addJob: (job: Omit<Job, 'id' | 'jobId' | 'createdAt' | 'updatedAt'>) => void;
  updateJob: (id: string, job: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  getJob: (id: string) => Job | undefined;

  // Income
  income: IncomeEntry[];
  addIncomeEntry: (entry: Omit<IncomeEntry, 'id' | 'createdAt'>) => void;
  deleteIncomeEntry: (id: string) => void;

  // Expenses
  expenses: ExpenseEntry[];
  addExpenseEntry: (entry: Omit<ExpenseEntry, 'id' | 'createdAt'>) => void;
  deleteExpenseEntry: (id: string) => void;

  // Stock
  stock: StockItem[];
  addStockItem: (item: Omit<StockItem, 'id' | 'createdAt'>) => void;
  updateStockItem: (id: string, item: Partial<StockItem>) => void;
  deleteStockItem: (id: string) => void;

  // Persistence
  loadFromStorage: () => void;
  saveToStorage: () => void;
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
  currency: 'GH₵',
  invoicePrefix: 'RC',
  monthlyRevenueTarget: 10000,
};

export const useDataStore = create<DataState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  clients: [],
  invoices: [],
  quotations: [],
  jobs: [],
  income: [],
  expenses: [],
  stock: [],

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
    get().saveToStorage();
  },

  addClient: (client) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({
      clients: [...state.clients, { ...client, id, createdAt: new Date().toISOString() }],
    }));
    get().saveToStorage();
  },

  updateClient: (id, client) => {
    set((state) => ({
      clients: state.clients.map((c) => (c.id === id ? { ...c, ...client } : c)),
    }));
    get().saveToStorage();
  },

  deleteClient: (id) => {
    set((state) => ({
      clients: state.clients.filter((c) => c.id !== id),
    }));
    get().saveToStorage();
  },

  getClient: (id) => {
    return get().clients.find((c) => c.id === id);
  },

  addInvoice: (invoice) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({
      invoices: [
        ...state.invoices,
        {
          ...invoice,
          id,
          number: invoice.number || generateInvoiceNumber(state.settings.invoicePrefix),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    }));
    get().saveToStorage();
  },

  updateInvoice: (id, invoice) => {
    set((state) => ({
      invoices: state.invoices.map((inv) =>
        inv.id === id ? { ...inv, ...invoice, updatedAt: new Date().toISOString() } : inv
      ),
    }));
    get().saveToStorage();
  },

  deleteInvoice: (id) => {
    set((state) => ({
      invoices: state.invoices.filter((inv) => inv.id !== id),
    }));
    get().saveToStorage();
  },

  getInvoice: (id) => {
    return get().invoices.find((inv) => inv.id === id);
  },

  addQuotation: (quotation) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({
      quotations: [
        ...state.quotations,
        {
          ...quotation,
          id,
          number: quotation.number || generateQuoteNumber(state.settings.invoicePrefix),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    }));
    get().saveToStorage();
  },

  updateQuotation: (id, quotation) => {
    set((state) => ({
      quotations: state.quotations.map((q) =>
        q.id === id ? { ...q, ...quotation, updatedAt: new Date().toISOString() } : q
      ),
    }));
    get().saveToStorage();
  },

  deleteQuotation: (id) => {
    set((state) => ({
      quotations: state.quotations.filter((q) => q.id !== id),
    }));
    get().saveToStorage();
  },

  getQuotation: (id) => {
    return get().quotations.find((q) => q.id === id);
  },

  addJob: (job) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({
      jobs: [
        ...state.jobs,
        {
          ...job,
          id,
          jobId: generateJobId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    }));
    get().saveToStorage();
  },

  updateJob: (id, job) => {
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === id ? { ...j, ...job, updatedAt: new Date().toISOString() } : j
      ),
    }));
    get().saveToStorage();
  },

  deleteJob: (id) => {
    set((state) => ({
      jobs: state.jobs.filter((j) => j.id !== id),
    }));
    get().saveToStorage();
  },

  getJob: (id) => {
    return get().jobs.find((j) => j.id === id);
  },

  addIncomeEntry: (entry) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({
      income: [...state.income, { ...entry, id, createdAt: new Date().toISOString() }],
    }));
    get().saveToStorage();
  },

  deleteIncomeEntry: (id) => {
    set((state) => ({
      income: state.income.filter((e) => e.id !== id),
    }));
    get().saveToStorage();
  },

  addExpenseEntry: (entry) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({
      expenses: [...state.expenses, { ...entry, id, createdAt: new Date().toISOString() }],
    }));
    get().saveToStorage();
  },

  deleteExpenseEntry: (id) => {
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    }));
    get().saveToStorage();
  },

  addStockItem: (item) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({
      stock: [...state.stock, { ...item, id, createdAt: new Date().toISOString() }],
    }));
    get().saveToStorage();
  },

  updateStockItem: (id, item) => {
    set((state) => ({
      stock: state.stock.map((s) => (s.id === id ? { ...s, ...item } : s)),
    }));
    get().saveToStorage();
  },

  deleteStockItem: (id) => {
    set((state) => ({
      stock: state.stock.filter((s) => s.id !== id),
    }));
    get().saveToStorage();
  },

  loadFromStorage: () => {
    const stored = localStorage.getItem('rollsApp');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        set({
          settings: data.settings || DEFAULT_SETTINGS,
          clients: data.clients || [],
          invoices: data.invoices || [],
          quotations: data.quotations || [],
          jobs: data.jobs || [],
          income: data.income || [],
          expenses: data.expenses || [],
          stock: data.stock || [],
        });
      } catch (e) {
        console.error('Failed to load data from storage', e);
      }
    }
  },

  saveToStorage: () => {
    const state = get();
    const data = {
      settings: state.settings,
      clients: state.clients,
      invoices: state.invoices,
      quotations: state.quotations,
      jobs: state.jobs,
      income: state.income,
      expenses: state.expenses,
      stock: state.stock,
    };
    localStorage.setItem('rollsApp', JSON.stringify(data));
  },
}));
