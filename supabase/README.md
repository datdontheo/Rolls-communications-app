# Supabase Setup Guide

## Step 1: Create Tables in Supabase

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the entire contents of `schema.sql` (in this folder) and paste it
6. Click **Run** to create all tables and indexes

## Step 2: Verify Connection

The app will now:
- Try to connect to Supabase on startup
- Fall back to localStorage if Supabase is unavailable
- Sync data bidirectionally between Supabase and localStorage

## Step 3: Test the Integration

1. Run `npm run dev`
2. Create a new client, invoice, or job
3. Check your Supabase database to verify the data was saved
4. Refresh the page — data should load from Supabase

## Database Schema

### Tables:
- `clients` — Client directory
- `invoices` — Invoice records
- `quotations` — Quotation records
- `jobs` — Job orders
- `income_entries` — Income tracking
- `expense_entries` — Expense tracking
- `stock_items` — Inventory
- `company_settings` — App settings

## Row Level Security (RLS)

Currently RLS is enabled but policies are not configured. For a multi-user app, you'd add RLS policies to restrict access by user ID. For now, all authenticated users can access all data.

To disable RLS (for development):
```sql
alter table clients disable row level security;
-- ... repeat for other tables
```

## Environment Variables

Required in `.env.local`:
```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

These are NOT committed to Git for security.

## Syncing Demo Data (Optional)

To migrate existing localStorage data to Supabase:
1. The app will automatically sync on next login
2. Or manually: Go to Settings → Export all data, then import in Supabase SQL Editor

## Troubleshooting

**Connection fails:**
- Check your `.env.local` file
- Verify environment variables are correct
- Check Supabase project is active

**Data not syncing:**
- Check browser console for errors
- Ensure localStorage isn't blocking Supabase
- Manually refresh the page

**Schema errors:**
- Run each table creation separately if there are conflicts
- Drop and recreate tables if needed:
  ```sql
  drop table if exists invoices cascade;
  ```
