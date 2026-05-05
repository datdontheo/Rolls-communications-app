export interface User {
  username: string;
  authenticated: boolean;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  company?: string;
  email?: string;
  address?: string;
  category?: 'Prospect' | 'Active' | 'Retained';
  industry?: string;
  createdAt: string;
}

export interface LineItem {
  id: string;
  description: string;
  qty: number;
  unitCost: number;
}

export interface Invoice {
  id: string;
  number: string;
  type: 'proforma' | 'final' | 'receipt';
  clientId: string;
  clientName: string;
  clientAddress: string;
  date: string;
  dueDate?: string;
  items: LineItem[];
  subtotal: number;
  vatRate: number;
  vat: number;
  total: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quotation {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  date: string;
  items: LineItem[];
  subtotal: number;
  vatRate: number;
  vat: number;
  total: number;
  status: 'Pending' | 'Accepted' | 'Rejected';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  jobId: string;
  clientId: string;
  clientName: string;
  serviceType: 'Advertising' | 'Printing' | 'Fabrication' | 'Design' | 'Media';
  status: 'New' | 'In Progress' | 'Under Review' | 'Completed' | 'Delivered';
  assignedTo: string;
  deadline: string;
  linkedQuotationId?: string;
  linkedInvoiceId?: string;
  stages: ProductionStage[];
  internalNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionStage {
  id: string;
  name: string;
  completed: boolean;
  completedAt?: string;
}

export interface IncomeEntry {
  id: string;
  date: string;
  clientId?: string;
  clientName: string;
  serviceType: 'Advertising' | 'Printing' | 'Fabrication' | 'Design' | 'Media';
  description: string;
  amount: number;
  paymentMethod: 'Cash' | 'Mobile Money' | 'Bank Transfer' | 'Cheque';
  createdAt: string;
}

export interface ExpenseEntry {
  id: string;
  date: string;
  category: 'Raw Materials' | 'Equipment' | 'Utilities' | 'Salaries' | 'Supplier Payment' | 'Petty Cash' | 'Other';
  description: string;
  vendor: string;
  amount: number;
  createdAt: string;
}

export interface StockItem {
  id: string;
  materialName: string;
  category: 'Paper' | 'Vinyl' | 'Ink' | 'Metal' | 'Substrate' | 'Other';
  unit: string;
  currentStock: number;
  reorderLevel: number;
  unitCost: number;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  type: 'in' | 'out' | 'wastage';
  quantity: number;
  reference?: string;
  date: string;
  createdAt: string;
}

export interface CompanySettings {
  companyName: string;
  logo: string; // base64
  address: string;
  poBox: string;
  phone: string[];
  emails: string[];
  website: string;
  vatRate: number;
  currency: string;
  invoicePrefix: string;
  monthlyRevenueTarget: number;
}

export interface AppTheme {
  isDark: boolean;
}
