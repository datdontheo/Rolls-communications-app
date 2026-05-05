# Rolls Communications — Business Portal

Internal business management web app for **Rolls Communications**, an advertising agency, printing company, and media production house based in Accra, Ghana.

---

## Features

- **Dashboard** — KPI cards, revenue vs. expenses chart, revenue by service type, recent activity feed
- **Invoices** — Create proforma / final / receipt invoices, PDF preview & download, status tracking (Draft → Sent → Paid / Overdue)
- **Quotations** — Build quotes with line items, convert accepted quotes to job orders or invoices
- **Job Orders** — Track production stages per job, pipeline view with deadline highlighting
- **Clients** — Client directory with category management (Prospect / Active / Retained)
- **Financials** — Log income and expense entries, running totals and profit summary
- **Inventory** — Stock level tracking with low-stock alerts and reorder indicators
- **Reports** — 12-month P&L chart, revenue by service, job completion rate, AR aging buckets
- **Settings** — Company profile, logo upload, VAT rate, currency, invoice prefix, monthly revenue target
- **Dark / Light mode** toggle

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS v4 + CSS custom properties |
| State | Zustand (localStorage persistence) |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod |
| PDF | @react-pdf/renderer |
| Charts | Recharts |
| Icons | Lucide React |
| Date utils | date-fns |

---

## Project Structure

```
src/
├── components/         # Shared UI components
│   ├── ClientForm.tsx
│   ├── Header.tsx
│   ├── InvoiceForm.tsx
│   ├── InvoicePDF.tsx
│   ├── JobForm.tsx
│   ├── Layout.tsx
│   ├── Modal.tsx
│   ├── QuotationForm.tsx
│   ├── Sidebar.tsx
│   ├── StatCard.tsx
│   └── Toast.tsx
├── pages/              # Route-level page components
│   ├── ClientsPage.tsx
│   ├── DashboardPage.tsx
│   ├── FinancialsPage.tsx
│   ├── InventoryPage.tsx
│   ├── InvoicesPage.tsx
│   ├── JobsPage.tsx
│   ├── LoginPage.tsx
│   ├── QuotationsPage.tsx
│   ├── ReportsPage.tsx
│   └── SettingsPage.tsx
├── stores/             # Zustand state stores
│   ├── authStore.ts
│   ├── dataStore.ts
│   └── themeStore.ts
├── types/              # TypeScript interfaces
│   └── index.ts
└── utils/              # Helpers and seed data
    ├── formatting.ts
    ├── generators.ts
    └── seedData.ts
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
git clone https://github.com/datdontheo/rolls-communications-app.git
cd rolls-communications-app
npm install
```

### Development

```bash
npm run dev
```

App runs at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview   # preview the production build locally
```

---

## Login

| Username | Password |
|---|---|
| `admin` | `rolls2024` |

> Password can be changed from **Settings → Security**.

---

## Demo Data

On first launch (empty localStorage), the app seeds realistic Ghanaian business sample data:

- **5 clients** — Akrofi-Christaller Institute, GN Bank Ghana Ltd, Kofi Asante Mensah, Accra City Mall Ltd, Ghana Tourism Authority
- **3 invoices** — one Paid (GH₵43,500 branded merchandise for Akrofi), one Sent, one Overdue
- **3 quotations** — Pending, Accepted, and Rejected examples
- **3 jobs** — New, In Progress, and Completed with production stages
- **Income & expense history** — 7 months of entries for dashboard and report charts
- **14 inventory items** — vinyl rolls, inks, paper, substrates, blank branded items

To reset to demo data, clear the `rollsApp` key from browser localStorage and refresh.

---

## Deployment

The app is deployed on **Vercel**. The `vercel.json` in the root configures SPA fallback routing so direct URL access and page refreshes work correctly.

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Push to `main` triggers an automatic Vercel deployment.

---

## Currency & Locale

- Currency: **Ghana Cedi (GH₵)**
- Date display: **DD/MM/YYYY**
- VAT default: **20%** (configurable in Settings)
- All data stored offline in browser **localStorage** — no backend required
