export function generateInvoiceNumber(prefix: string = 'RC'): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `${prefix}-${year}-${random}`;
}

export function generateJobId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `JOB-${year}-${random}`;
}

export function generateQuoteNumber(prefix: string = 'RC'): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `${prefix}-QT-${year}-${random}`;
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
