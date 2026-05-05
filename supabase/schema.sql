-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Clients table
create table if not exists clients (
  id text primary key,
  name text not null,
  company text not null,
  phone text not null,
  email text not null,
  address text not null,
  category text not null check (category in ('Prospect', 'Active', 'Retained')),
  industry text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Invoices table
create table if not exists invoices (
  id text primary key,
  number text unique not null,
  type text not null check (type in ('proforma', 'final', 'receipt')),
  client_id text references clients(id) on delete cascade,
  client_name text not null,
  client_address text not null,
  date text not null,
  due_date text,
  items jsonb not null,
  subtotal numeric not null,
  vat_rate numeric not null default 20,
  vat numeric not null,
  total numeric not null,
  status text not null check (status in ('Draft', 'Sent', 'Paid', 'Overdue')),
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Quotations table
create table if not exists quotations (
  id text primary key,
  number text unique not null,
  client_id text references clients(id) on delete cascade,
  client_name text not null,
  date text not null,
  items jsonb not null,
  subtotal numeric not null,
  vat_rate numeric not null default 20,
  vat numeric not null,
  total numeric not null,
  status text not null check (status in ('Pending', 'Accepted', 'Rejected')),
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Jobs table
create table if not exists jobs (
  id text primary key,
  job_id text unique not null,
  client_id text references clients(id) on delete cascade,
  client_name text not null,
  service_type text not null check (service_type in ('Advertising', 'Printing', 'Fabrication', 'Design', 'Media')),
  status text not null check (status in ('New', 'In Progress', 'Under Review', 'Completed', 'Delivered')),
  assigned_to text not null,
  deadline text not null,
  linked_quotation_id text,
  linked_invoice_id text,
  stages jsonb not null,
  internal_notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Income entries table
create table if not exists income_entries (
  id text primary key,
  date text not null,
  client_id text references clients(id) on delete set null,
  client_name text not null,
  service_type text not null check (service_type in ('Advertising', 'Printing', 'Fabrication', 'Design', 'Media')),
  description text not null,
  amount numeric not null,
  payment_method text not null check (payment_method in ('Cash', 'Mobile Money', 'Bank Transfer', 'Cheque')),
  created_at timestamp with time zone default now()
);

-- Expense entries table
create table if not exists expense_entries (
  id text primary key,
  date text not null,
  category text not null check (category in ('Raw Materials', 'Equipment', 'Utilities', 'Salaries', 'Supplier Payment', 'Petty Cash', 'Other')),
  description text not null,
  vendor text not null,
  amount numeric not null,
  created_at timestamp with time zone default now()
);

-- Stock items table
create table if not exists stock_items (
  id text primary key,
  material_name text not null,
  category text not null check (category in ('Paper', 'Vinyl', 'Ink', 'Metal', 'Substrate', 'Other')),
  unit text not null,
  current_stock numeric not null,
  reorder_level numeric not null,
  unit_cost numeric not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Company settings table
create table if not exists company_settings (
  id text primary key default 'settings',
  company_name text not null,
  logo text,
  address text not null,
  po_box text not null,
  phone jsonb not null,
  emails jsonb not null,
  website text not null,
  vat_rate numeric not null,
  currency text not null,
  invoice_prefix text not null,
  monthly_revenue_target numeric not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- User preferences table
create table if not exists settings (
  key text primary key,
  theme_preference text default 'light',
  admin_password text default 'rolls2024',
  updated_at timestamp with time zone default now()
);

-- Create indexes for better query performance
create index if not exists idx_invoices_client_id on invoices(client_id);
create index if not exists idx_invoices_status on invoices(status);
create index if not exists idx_invoices_date on invoices(date);
create index if not exists idx_quotations_client_id on quotations(client_id);
create index if not exists idx_quotations_status on quotations(status);
create index if not exists idx_jobs_client_id on jobs(client_id);
create index if not exists idx_jobs_status on jobs(status);
create index if not exists idx_income_date on income_entries(date);
create index if not exists idx_expense_date on expense_entries(date);

-- Disable row level security to allow anon key access
alter table clients disable row level security;
alter table invoices disable row level security;
alter table quotations disable row level security;
alter table jobs disable row level security;
alter table income_entries disable row level security;
alter table expense_entries disable row level security;
alter table stock_items disable row level security;
alter table company_settings disable row level security;
alter table settings disable row level security;
