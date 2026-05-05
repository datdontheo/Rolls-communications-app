import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useDataStore } from '../stores/dataStore';
import { Download, FileText } from 'lucide-react';

const styles = StyleSheet.create({
  page: { padding: 48, fontFamily: 'Helvetica', backgroundColor: '#FFFFFF', fontSize: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36, paddingBottom: 24, borderBottomWidth: 2, borderBottomColor: '#1D9E75' },
  logoBox: { width: 48, height: 48, backgroundColor: '#1D9E75', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'Helvetica-Bold' },
  companyName: { fontSize: 16, fontWeight: 'bold', color: '#141414', fontFamily: 'Helvetica-Bold', marginBottom: 3 },
  companyDetail: { fontSize: 9, color: '#71717a', lineHeight: 1.5 },
  receiptLabel: { fontSize: 24, fontWeight: 'bold', color: '#1D9E75', fontFamily: 'Helvetica-Bold', textAlign: 'right' },
  receiptNum: { fontSize: 11, color: '#71717a', textAlign: 'right', marginTop: 4 },
  badgeReceived: { fontSize: 11, fontWeight: 'bold', color: '#16a34a', fontFamily: 'Helvetica-Bold', marginTop: 6, padding: '6 12', backgroundColor: '#f0fdf4', borderRadius: 4, textAlign: 'center' },
  metaRow: { flexDirection: 'row', gap: 40, marginBottom: 28, marginTop: 24 },
  metaBlock: { flex: 1 },
  metaTitle: { fontSize: 9, fontWeight: 'bold', color: '#71717a', letterSpacing: 0.8, textTransform: 'uppercase', fontFamily: 'Helvetica-Bold', marginBottom: 6 },
  metaValue: { fontSize: 11, color: '#141414', lineHeight: 1.5 },
  section: { marginTop: 28, marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#141414', fontFamily: 'Helvetica-Bold', marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#e4e4e7' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f4f4f5' },
  label: { fontSize: 10, color: '#71717a' },
  value: { fontSize: 11, color: '#141414', fontFamily: 'Helvetica-Bold' },
  totalsBox: { marginTop: 28, padding: 16, backgroundColor: '#f9f9f9', borderRadius: 6 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  amountLabel: { fontSize: 10, color: '#71717a' },
  amountValue: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#141414' },
  grandTotal: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 2, borderTopColor: '#1D9E75', paddingTopWidth: 10, marginTop: 8 },
  grandLabel: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#141414' },
  grandValue: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#1D9E75' },
  footer: { position: 'absolute', bottom: 36, left: 48, right: 48, borderTopWidth: 1, borderTopColor: '#e4e4e7', paddingTop: 14, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 8, color: '#a1a1aa' },
  thankYou: { marginTop: 32, textAlign: 'center', fontSize: 11, color: '#71717a', fontStyle: 'italic' },
});

function PDFDoc({ invoiceId }: { invoiceId: string }) {
  const { getInvoice, settings } = useDataStore();
  const inv = getInvoice(invoiceId);

  if (!inv) return null;

  const receiptDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const invoiceDate = new Date(inv.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <Document title={`Receipt-${inv.number}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>RC</Text>
            </View>
            <Text style={styles.companyName}>{settings.companyName}</Text>
            <Text style={styles.companyDetail}>{settings.address}</Text>
            <Text style={styles.companyDetail}>{settings.poBox}</Text>
            <Text style={styles.companyDetail}>{settings.phone.join(' / ')}</Text>
            <Text style={styles.companyDetail}>{settings.emails[0]}</Text>
            <Text style={styles.companyDetail}>{settings.website}</Text>
          </View>
          <View>
            <Text style={styles.receiptLabel}>PAYMENT RECEIVED</Text>
            <Text style={styles.receiptNum}>Invoice: {inv.number}</Text>
            <Text style={styles.badgeReceived}>✓ PAID IN FULL</Text>
          </View>
        </View>

        {/* Client & Payment Details */}
        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaTitle}>Bill To</Text>
            <Text style={styles.metaValue}>{inv.clientName}</Text>
            <Text style={styles.metaValue}>{inv.clientAddress}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaTitle}>Payment Details</Text>
            <Text style={styles.metaValue}>Invoice Date: {invoiceDate}</Text>
            <Text style={styles.metaValue}>Payment Date: {receiptDate}</Text>
            <Text style={styles.metaValue}>Status: Paid</Text>
          </View>
        </View>

        {/* Invoice Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoice Summary</Text>
          {inv.items.map((item, idx) => (
            <View key={idx} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{item.description}</Text>
              </View>
              <View style={{ width: 60, textAlign: 'center' }}>
                <Text style={styles.label}>Qty: {item.qty}</Text>
              </View>
              <View style={{ width: 80, textAlign: 'right' }}>
                <Text style={styles.value}>
                  {settings.currency} {(item.qty * item.unitCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Amount Due */}
        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={styles.amountLabel}>Subtotal</Text>
            <Text style={styles.amountValue}>
              {settings.currency} {inv.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.amountLabel}>VAT ({settings.vatRate}%)</Text>
            <Text style={styles.amountValue}>
              {settings.currency} {inv.vat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.grandTotal}>
            <Text style={styles.grandLabel}>Amount Received</Text>
            <Text style={styles.grandValue}>
              {settings.currency} {inv.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {/* Thank You */}
        <Text style={styles.thankYou}>Thank you for your payment. This receipt confirms payment in full.</Text>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{settings.companyName} • {settings.website}</Text>
          <Text style={styles.footerText}>Generated: {receiptDate}</Text>
        </View>
      </Page>
    </Document>
  );
}

export default function PaymentReceiptPDF({ invoiceId }: { invoiceId: string }) {
  const { getInvoice } = useDataStore();
  const inv = getInvoice(invoiceId);

  if (!inv) return <div style={{ color: '#dc2626' }}>Invoice not found</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ padding: '16px 20px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
          <FileText size={18} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 600 }}>Receipt for {inv.number}</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>· {inv.clientName} · Paid</span>
        </div>
        <PDFDownloadLink
          document={<PDFDoc invoiceId={invoiceId} />}
          fileName={`Receipt-${inv.number}.pdf`}
          className="btn btn-primary"
        >
          {({ loading }) => (
            <><Download size={16} /> {loading ? 'Generating…' : 'Download Payment Receipt'}</>
          )}
        </PDFDownloadLink>
      </div>
    </div>
  );
}
