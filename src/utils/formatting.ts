import { format } from 'date-fns';

// Map currency codes to their display symbol. GHS renders as the cedi sign to
// match how the business writes it; unknown codes fall back to the raw code.
const CURRENCY_SYMBOLS: Record<string, string> = {
  GHS: 'GH₵',
};

export function currencySymbol(currency: string = 'GHS'): string {
  return CURRENCY_SYMBOLS[currency] ?? currency;
}

export function formatCurrency(amount: number, currency: string = 'GHS'): string {
  return `${currencySymbol(currency)} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Ghana locale uses day/month/year.
export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yyyy');
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yyyy HH:mm');
}

export function calculateVAT(amount: number, rate: number = 20): number {
  return (amount * rate) / 100;
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

export function truncate(str: string, length: number = 50): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
