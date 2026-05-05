import type {
  Client, Invoice, Quotation, Job,
  IncomeEntry, ExpenseEntry, StockItem,
} from '../types';

// Fixed IDs so cross-references (clientId → invoices, jobs) are consistent
const C = {
  akrofi:   'seed-cli-001',
  gnbank:   'seed-cli-002',
  kofi:     'seed-cli-003',
  accracity:'seed-cli-004',
  gta:      'seed-cli-005',
};

function ts(dateStr: string) {
  return new Date(dateStr).toISOString();
}

export const SEED_CLIENTS: Client[] = [
  {
    id: C.akrofi,
    name: 'Akrofi-Christaller Institute',
    company: 'Akrofi-Christaller Institute of Theology',
    phone: '030 296 2381',
    email: 'info@acighana.org',
    address: 'P.O. Box SK 49, Akropong-Akuapem, Accra',
    category: 'Active',
    industry: 'Education & Research',
    createdAt: ts('2026-01-08'),
  },
  {
    id: C.gnbank,
    name: 'GN Bank Ghana Ltd',
    company: 'GN Bank Ghana Limited',
    phone: '030 274 5000',
    email: 'corporate@gnbankgh.com',
    address: '1 Agostino Neto Road, Airport Residential, Accra',
    category: 'Retained',
    industry: 'Banking & Finance',
    createdAt: ts('2025-09-15'),
  },
  {
    id: C.kofi,
    name: 'Kofi Asante Mensah',
    company: 'KAM Ventures',
    phone: '054 321 8877',
    email: 'kofi.mensah@kamventures.gh',
    address: 'East Legon, Accra',
    category: 'Active',
    industry: 'Entrepreneurship',
    createdAt: ts('2026-02-20'),
  },
  {
    id: C.accracity,
    name: 'Accra City Mall Ltd',
    company: 'Accra City Mall Limited',
    phone: '030 251 1700',
    email: 'marketing@accracitymall.com.gh',
    address: 'Spintex Road, Accra',
    category: 'Active',
    industry: 'Retail & Real Estate',
    createdAt: ts('2025-11-03'),
  },
  {
    id: C.gta,
    name: 'Ghana Tourism Authority',
    company: 'Ghana Tourism Authority',
    phone: '030 222 3111',
    email: 'info@gta.gov.gh',
    address: 'P.O. Box GP 3106, Accra',
    category: 'Prospect',
    industry: 'Government & Tourism',
    createdAt: ts('2026-04-01'),
  },
];

export const SEED_INVOICES: Invoice[] = [
  {
    // Akrofi — PAID — the real invoice (GH₵43,500 for branded items)
    id: 'seed-inv-001',
    number: 'RC-2026-0042',
    type: 'final',
    clientId: C.akrofi,
    clientName: 'Akrofi-Christaller Institute',
    clientAddress: 'P.O. Box SK 49, Akropong-Akuapem, Accra',
    date: '2026-04-10',
    dueDate: '2026-04-24',
    items: [
      { id: 'li-001', description: 'Branded Tote Bags (custom screen-print, cotton)', qty: 200, unitCost: 100.00 },
      { id: 'li-002', description: 'Branded Pens (UV logo print, ballpoint)', qty: 500, unitCost: 15.00 },
      { id: 'li-003', description: 'Branded Notepads (A5, full-colour cover, 80pp)', qty: 250, unitCost: 35.00 },
    ],
    subtotal: 36250.00,
    vat: 7250.00,
    total: 43500.00,
    status: 'Paid',
    notes: 'Payment received via bank transfer. Thank you for your business.',
    createdAt: ts('2026-04-10'),
    updatedAt: ts('2026-04-25'),
  },
  {
    // GN Bank — SENT
    id: 'seed-inv-002',
    number: 'RC-2026-0051',
    type: 'final',
    clientId: C.gnbank,
    clientName: 'GN Bank Ghana Ltd',
    clientAddress: '1 Agostino Neto Road, Airport Residential, Accra',
    date: '2026-04-28',
    dueDate: '2026-05-12',
    items: [
      { id: 'li-004', description: '6×10ft Outdoor Flex Banners (set of 4)', qty: 4, unitCost: 1800.00 },
      { id: 'li-005', description: 'A4 Full-Colour Flyers (500 units, glossy)', qty: 500, unitCost: 4.50 },
      { id: 'li-006', description: 'In-Branch Poster Design & Print (A2, set of 10)', qty: 10, unitCost: 220.00 },
    ],
    subtotal: 11650.00,
    vat: 2330.00,
    total: 13980.00,
    status: 'Sent',
    notes: 'Payment due 14 days from invoice date. Bank transfer preferred.',
    createdAt: ts('2026-04-28'),
    updatedAt: ts('2026-04-28'),
  },
  {
    // Accra City Mall — OVERDUE
    id: 'seed-inv-003',
    number: 'RC-2026-0038',
    type: 'final',
    clientId: C.accracity,
    clientName: 'Accra City Mall Ltd',
    clientAddress: 'Spintex Road, Accra',
    date: '2026-03-15',
    dueDate: '2026-03-29',
    items: [
      { id: 'li-007', description: 'Full-Colour Brochure Design & Print (A4 tri-fold, 1000 units)', qty: 1000, unitCost: 8.50 },
      { id: 'li-008', description: 'Event Backdrop (8×6ft, full bleed)', qty: 2, unitCost: 1400.00 },
    ],
    subtotal: 11300.00,
    vat: 2260.00,
    total: 13560.00,
    status: 'Overdue',
    notes: 'Second reminder sent. Please contact us to arrange payment.',
    createdAt: ts('2026-03-15'),
    updatedAt: ts('2026-04-05'),
  },
];

export const SEED_QUOTATIONS: Quotation[] = [
  {
    id: 'seed-qt-001',
    number: 'RC-QT-2026-0017',
    clientId: C.gta,
    clientName: 'Ghana Tourism Authority',
    date: '2026-04-28',
    items: [
      { id: 'qi-001', description: '48-Sheet Billboard Design & Production (Airport Road)', qty: 2, unitCost: 8500.00 },
      { id: 'qi-002', description: 'Digital Advertising Campaign (30-day social media package)', qty: 1, unitCost: 5500.00 },
      { id: 'qi-003', description: 'Airport Scrolling Lightbox Ads (30-day placement)', qty: 4, unitCost: 1800.00 },
    ],
    subtotal: 29700.00,
    vat: 5940.00,
    total: 35640.00,
    status: 'Pending',
    notes: 'Prices valid for 30 days. Design revisions included (up to 3 rounds).',
    createdAt: ts('2026-04-28'),
    updatedAt: ts('2026-04-28'),
  },
  {
    id: 'seed-qt-002',
    number: 'RC-QT-2026-0014',
    clientId: C.kofi,
    clientName: 'Kofi Asante Mensah',
    date: '2026-04-15',
    items: [
      { id: 'qi-004', description: 'Business Card Design & Print (400gsm, matt laminate, 500 units)', qty: 500, unitCost: 3.20 },
      { id: 'qi-005', description: 'Company Profile Design (8-page A4, full colour)', qty: 1, unitCost: 1800.00 },
    ],
    subtotal: 3400.00,
    vat: 680.00,
    total: 4080.00,
    status: 'Accepted',
    notes: 'Client approved via email 18/04/2026.',
    createdAt: ts('2026-04-15'),
    updatedAt: ts('2026-04-18'),
  },
  {
    id: 'seed-qt-003',
    number: 'RC-QT-2026-0010',
    clientId: C.gnbank,
    clientName: 'GN Bank Ghana Ltd',
    date: '2026-03-30',
    items: [
      { id: 'qi-006', description: 'Full-Page Magazine Ad (design + placement, 3 months)', qty: 3, unitCost: 4200.00 },
    ],
    subtotal: 12600.00,
    vat: 2520.00,
    total: 15120.00,
    status: 'Rejected',
    notes: 'Client budget constraints — may revisit Q3.',
    createdAt: ts('2026-03-30'),
    updatedAt: ts('2026-04-08'),
  },
];

export const SEED_JOBS: Job[] = [
  {
    id: 'seed-job-001',
    jobId: 'JOB-2026-0031',
    clientId: C.gnbank,
    clientName: 'GN Bank Ghana Ltd',
    serviceType: 'Media',
    status: 'In Progress',
    assignedTo: 'Ama Owusu',
    deadline: '2026-05-15',
    linkedInvoiceId: 'seed-inv-002',
    stages: [
      { id: 's1', name: 'Concept & Scripting', completed: true, completedAt: ts('2026-04-22') },
      { id: 's2', name: 'Design Mockups', completed: true, completedAt: ts('2026-04-28') },
      { id: 's3', name: 'Production / Print', completed: false },
      { id: 's4', name: 'Quality Control', completed: false },
      { id: 's5', name: 'Client Delivery', completed: false },
    ],
    internalNotes: 'Client requested teal brand colour throughout. Banners for Osu and Tema branches.',
    createdAt: ts('2026-04-20'),
    updatedAt: ts('2026-04-28'),
  },
  {
    id: 'seed-job-002',
    jobId: 'JOB-2026-0025',
    clientId: C.kofi,
    clientName: 'Kofi Asante Mensah',
    serviceType: 'Printing',
    status: 'Completed',
    assignedTo: 'Kwame Tetteh',
    deadline: '2026-04-30',
    linkedQuotationId: 'seed-qt-002',
    stages: [
      { id: 's1', name: 'Design Brief', completed: true, completedAt: ts('2026-04-17') },
      { id: 's2', name: 'Design Mockup', completed: true, completedAt: ts('2026-04-20') },
      { id: 's3', name: 'Client Approval', completed: true, completedAt: ts('2026-04-21') },
      { id: 's4', name: 'Print Run', completed: true, completedAt: ts('2026-04-26') },
      { id: 's5', name: 'Delivery', completed: true, completedAt: ts('2026-04-28') },
    ],
    internalNotes: 'Business cards and company profile delivered to East Legon office. Client very satisfied.',
    createdAt: ts('2026-04-17'),
    updatedAt: ts('2026-04-28'),
  },
  {
    id: 'seed-job-003',
    jobId: 'JOB-2026-0035',
    clientId: C.gta,
    clientName: 'Ghana Tourism Authority',
    serviceType: 'Advertising',
    status: 'New',
    assignedTo: 'Unassigned',
    deadline: '2026-05-30',
    stages: [
      { id: 's1', name: 'Concept Development', completed: false },
      { id: 's2', name: 'Design & Artwork', completed: false },
      { id: 's3', name: 'Client Review', completed: false },
      { id: 's4', name: 'Production', completed: false },
      { id: 's5', name: 'Installation / Delivery', completed: false },
    ],
    internalNotes: 'Quote RC-QT-2026-0017 accepted verbally. Awaiting PO from client procurement.',
    createdAt: ts('2026-05-02'),
    updatedAt: ts('2026-05-02'),
  },
];

// Helper to build income/expense entries with sequential IDs
let incomeSeq = 1;
let expenseSeq = 1;
const mkIncome = (d: Omit<IncomeEntry, 'id' | 'createdAt'>): IncomeEntry => ({
  ...d, id: `seed-inc-${String(incomeSeq++).padStart(3, '0')}`, createdAt: ts(d.date),
});
const mkExp = (d: Omit<ExpenseEntry, 'id' | 'createdAt'>): ExpenseEntry => ({
  ...d, id: `seed-exp-${String(expenseSeq++).padStart(3, '0')}`, createdAt: ts(d.date),
});

export const SEED_INCOME: IncomeEntry[] = [
  // May 2026 (current month)
  mkIncome({ date: '2026-05-02', clientId: C.gnbank, clientName: 'GN Bank Ghana Ltd', serviceType: 'Media', description: 'Advance payment – banner & flyer production', amount: 7000.00, paymentMethod: 'Bank Transfer' }),
  mkIncome({ date: '2026-05-04', clientId: C.kofi, clientName: 'Kofi Asante Mensah', serviceType: 'Printing', description: 'Balance – business cards & company profile', amount: 3200.00, paymentMethod: 'Mobile Money' }),
  mkIncome({ date: '2026-05-04', clientName: 'Walk-in Customer', serviceType: 'Design', description: 'Logo design & branding package', amount: 2800.00, paymentMethod: 'Mobile Money' }),
  // April 2026
  mkIncome({ date: '2026-04-25', clientId: C.akrofi, clientName: 'Akrofi-Christaller Institute', serviceType: 'Printing', description: 'Invoice RC-2026-0042 – branded merchandise payment', amount: 43500.00, paymentMethod: 'Bank Transfer' }),
  mkIncome({ date: '2026-04-12', clientName: 'Reputable Foods Ltd', serviceType: 'Printing', description: 'Packaging label prints (5000 units)', amount: 8400.00, paymentMethod: 'Cheque' }),
  mkIncome({ date: '2026-04-06', clientName: 'EcoFarm Ghana', serviceType: 'Design', description: 'Annual report layout & design', amount: 4200.00, paymentMethod: 'Bank Transfer' }),
  // March 2026
  mkIncome({ date: '2026-03-28', clientId: C.accracity, clientName: 'Accra City Mall Ltd', serviceType: 'Printing', description: 'Brochure & backdrop (partial payment)', amount: 7000.00, paymentMethod: 'Cheque' }),
  mkIncome({ date: '2026-03-18', clientName: 'Vodafone Ghana', serviceType: 'Advertising', description: 'Retail activation branding (Tema branch)', amount: 11500.00, paymentMethod: 'Bank Transfer' }),
  mkIncome({ date: '2026-03-07', clientName: 'MTN Business', serviceType: 'Fabrication', description: 'Fabricated signage – head office lobby', amount: 18200.00, paymentMethod: 'Bank Transfer' }),
  // February 2026
  mkIncome({ date: '2026-02-24', clientName: 'Accra Metropolitan Assembly', serviceType: 'Printing', description: 'Public notice prints & banners (Q1)', amount: 6300.00, paymentMethod: 'Cheque' }),
  mkIncome({ date: '2026-02-14', clientName: 'Pee Jay Restaurant', serviceType: 'Design', description: "Valentine's Day promotional materials", amount: 1850.00, paymentMethod: 'Cash' }),
  mkIncome({ date: '2026-02-05', clientName: 'Standard Chartered Ghana', serviceType: 'Advertising', description: 'Outdoor campaign – 3 billboard sites (Feb)', amount: 22000.00, paymentMethod: 'Bank Transfer' }),
  // January 2026
  mkIncome({ date: '2026-01-28', clientName: 'Ghana Education Service', serviceType: 'Printing', description: 'BECE revision booklets print run', amount: 14500.00, paymentMethod: 'Bank Transfer' }),
  mkIncome({ date: '2026-01-15', clientName: 'Stanbic IBTC Ghana', serviceType: 'Fabrication', description: 'Branch signage fabrication (Labone)', amount: 9800.00, paymentMethod: 'Cheque' }),
  mkIncome({ date: '2026-01-07', clientName: 'Unilever Ghana', serviceType: 'Advertising', description: 'New year campaign – retail POS materials', amount: 16400.00, paymentMethod: 'Bank Transfer' }),
  // December 2025
  mkIncome({ date: '2025-12-22', clientName: 'Shoprite Ghana', serviceType: 'Printing', description: 'Christmas promotional print package', amount: 19500.00, paymentMethod: 'Bank Transfer' }),
  mkIncome({ date: '2025-12-10', clientName: 'Kasapreko Company Ltd', serviceType: 'Advertising', description: 'End-of-year billboard campaign (Accra)', amount: 28000.00, paymentMethod: 'Cheque' }),
  // November 2025
  mkIncome({ date: '2025-11-25', clientId: C.gnbank, clientName: 'GN Bank Ghana Ltd', serviceType: 'Media', description: 'Brand refresh – TV commercial production', amount: 35000.00, paymentMethod: 'Bank Transfer' }),
  mkIncome({ date: '2025-11-12', clientName: 'Electroland Ghana', serviceType: 'Fabrication', description: 'Mall kiosk branding & fabrication', amount: 12600.00, paymentMethod: 'Bank Transfer' }),
];

export const SEED_EXPENSES: ExpenseEntry[] = [
  // May 2026
  mkExp({ date: '2026-05-01', category: 'Salaries', description: 'Staff salaries – May 2026', vendor: 'Internal Payroll', amount: 12000.00 }),
  mkExp({ date: '2026-05-01', category: 'Utilities', description: 'ECG electricity bill – April', vendor: 'Electricity Company of Ghana', amount: 950.00 }),
  mkExp({ date: '2026-05-02', category: 'Raw Materials', description: 'Eco-solvent ink restock (6 litres, mixed colours)', vendor: 'Mara Digitech Ltd', amount: 2400.00 }),
  mkExp({ date: '2026-05-03', category: 'Raw Materials', description: 'Gloss & matte vinyl rolls (3 rolls)', vendor: 'Pixel Media Supplies', amount: 1680.00 }),
  mkExp({ date: '2026-05-04', category: 'Petty Cash', description: 'Delivery & transport costs', vendor: 'Various', amount: 320.00 }),
  // April 2026
  mkExp({ date: '2026-04-01', category: 'Salaries', description: 'Staff salaries – April 2026', vendor: 'Internal Payroll', amount: 12000.00 }),
  mkExp({ date: '2026-04-03', category: 'Raw Materials', description: 'Tote bag blanks (100 units)', vendor: 'Accra Textile Hub', amount: 3500.00 }),
  mkExp({ date: '2026-04-05', category: 'Raw Materials', description: 'Pen & notepad blanks for Akrofi order', vendor: 'Office Bazaar Ghana', amount: 4200.00 }),
  mkExp({ date: '2026-04-08', category: 'Utilities', description: 'Water & internet – March', vendor: 'Various', amount: 680.00 }),
  mkExp({ date: '2026-04-15', category: 'Equipment', description: 'Plotter blade replacement + maintenance', vendor: 'PrintTech Ghana', amount: 1100.00 }),
  mkExp({ date: '2026-04-22', category: 'Petty Cash', description: 'Office supplies & refreshments', vendor: 'Various', amount: 450.00 }),
  // March 2026
  mkExp({ date: '2026-03-01', category: 'Salaries', description: 'Staff salaries – March 2026', vendor: 'Internal Payroll', amount: 12000.00 }),
  mkExp({ date: '2026-03-05', category: 'Raw Materials', description: 'Flex banner material (5 rolls)', vendor: 'Pixel Media Supplies', amount: 3800.00 }),
  mkExp({ date: '2026-03-12', category: 'Supplier Payment', description: 'Print substrate supplier – Q1 balance', vendor: 'West Africa Print Supplies', amount: 6200.00 }),
  mkExp({ date: '2026-03-20', category: 'Utilities', description: 'ECG bill & internet', vendor: 'Various', amount: 1050.00 }),
  // February 2026
  mkExp({ date: '2026-02-01', category: 'Salaries', description: 'Staff salaries – February 2026', vendor: 'Internal Payroll', amount: 12000.00 }),
  mkExp({ date: '2026-02-10', category: 'Raw Materials', description: 'A4 paper reams (50 reams) & glossy photo paper', vendor: 'Printmaster Ghana', amount: 2100.00 }),
  mkExp({ date: '2026-02-18', category: 'Equipment', description: 'Large format printer servicing', vendor: 'PrintTech Ghana', amount: 2500.00 }),
  // January 2026
  mkExp({ date: '2026-01-02', category: 'Salaries', description: 'Staff salaries – January 2026', vendor: 'Internal Payroll', amount: 11500.00 }),
  mkExp({ date: '2026-01-10', category: 'Raw Materials', description: 'New year raw materials restock (ink, vinyl, substrate)', vendor: 'Mara Digitech Ltd', amount: 8500.00 }),
  mkExp({ date: '2026-01-20', category: 'Utilities', description: 'ECG & water – December arrears + January', vendor: 'Various', amount: 1400.00 }),
  // December 2025
  mkExp({ date: '2025-12-01', category: 'Salaries', description: 'Staff salaries + Christmas bonus', vendor: 'Internal Payroll', amount: 16500.00 }),
  mkExp({ date: '2025-12-05', category: 'Raw Materials', description: 'Bulk vinyl & flex material – festive orders', vendor: 'Pixel Media Supplies', amount: 9200.00 }),
  mkExp({ date: '2025-12-15', category: 'Supplier Payment', description: 'Year-end supplier settlement', vendor: 'West Africa Print Supplies', amount: 7500.00 }),
  // November 2025
  mkExp({ date: '2025-11-01', category: 'Salaries', description: 'Staff salaries – November 2025', vendor: 'Internal Payroll', amount: 11500.00 }),
  mkExp({ date: '2025-11-08', category: 'Raw Materials', description: 'Production materials for GN Bank media job', vendor: 'Media Production Store', amount: 5800.00 }),
  mkExp({ date: '2025-11-18', category: 'Equipment', description: 'Camera & lighting rental – GN Bank shoot', vendor: 'GH Film Equipment Ltd', amount: 4500.00 }),
];

let stockSeq = 1;
const mkStock = (d: Omit<StockItem, 'id' | 'createdAt'>): StockItem => ({
  ...d, id: `seed-stk-${String(stockSeq++).padStart(3, '0')}`, createdAt: ts('2026-04-01'),
});

export const SEED_STOCK: StockItem[] = [
  mkStock({ materialName: 'Gloss Vinyl Roll (60" × 50m)', category: 'Vinyl', unit: 'Roll', currentStock: 8, reorderLevel: 5, unitCost: 350.00 }),
  mkStock({ materialName: 'Matte Vinyl Roll (60" × 50m)', category: 'Vinyl', unit: 'Roll', currentStock: 3, reorderLevel: 4, unitCost: 380.00 }),
  mkStock({ materialName: 'Eco-Solvent Ink Cyan (1L)', category: 'Ink', unit: 'Litre', currentStock: 6, reorderLevel: 4, unitCost: 120.00 }),
  mkStock({ materialName: 'Eco-Solvent Ink Magenta (1L)', category: 'Ink', unit: 'Litre', currentStock: 2, reorderLevel: 3, unitCost: 120.00 }),
  mkStock({ materialName: 'Eco-Solvent Ink Yellow (1L)', category: 'Ink', unit: 'Litre', currentStock: 4, reorderLevel: 3, unitCost: 120.00 }),
  mkStock({ materialName: 'Eco-Solvent Ink Black (1L)', category: 'Ink', unit: 'Litre', currentStock: 5, reorderLevel: 4, unitCost: 115.00 }),
  mkStock({ materialName: 'A4 Paper (500-sheet ream)', category: 'Paper', unit: 'Ream', currentStock: 45, reorderLevel: 20, unitCost: 18.00 }),
  mkStock({ materialName: 'Photo Paper A3 Glossy (50-sheet pack)', category: 'Paper', unit: 'Pack', currentStock: 8, reorderLevel: 5, unitCost: 65.00 }),
  mkStock({ materialName: 'Flex Banner Material (1.5m × 50m roll)', category: 'Substrate', unit: 'Roll', currentStock: 12, reorderLevel: 5, unitCost: 280.00 }),
  mkStock({ materialName: 'Tote Bag Blank (cotton, 30×40cm)', category: 'Other', unit: 'Piece', currentStock: 50, reorderLevel: 100, unitCost: 22.00 }),
  mkStock({ materialName: 'Ballpoint Pen Blank (for branding)', category: 'Other', unit: 'Piece', currentStock: 350, reorderLevel: 200, unitCost: 8.00 }),
  mkStock({ materialName: 'Notepad Blank A5 (80pp, white cover)', category: 'Other', unit: 'Piece', currentStock: 80, reorderLevel: 50, unitCost: 22.00 }),
  mkStock({ materialName: 'Aluminium Composite Panel (1.22×2.44m)', category: 'Metal', unit: 'Sheet', currentStock: 15, reorderLevel: 8, unitCost: 185.00 }),
  mkStock({ materialName: 'PVC Foam Board (3mm, 1.22×2.44m)', category: 'Substrate', unit: 'Sheet', currentStock: 22, reorderLevel: 10, unitCost: 95.00 }),
];
