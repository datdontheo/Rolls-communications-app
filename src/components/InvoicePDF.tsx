import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
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
  invoiceLabel: { fontSize: 22, fontWeight: 'bold', color: '#1D9E75', fontFamily: 'Helvetica-Bold', textAlign: 'right' },
  invoiceNum: { fontSize: 11, color: '#71717a', textAlign: 'right', marginTop: 4 },
  metaRow: { flexDirection: 'row', gap: 40, marginBottom: 28 },
  metaBlock: { flex: 1 },
  metaTitle: { fontSize: 9, fontWeight: 'bold', color: '#71717a', letterSpacing: 0.8, textTransform: 'uppercase', fontFamily: 'Helvetica-Bold', marginBottom: 6 },
  metaValue: { fontSize: 11, color: '#141414', lineHeight: 1.5 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f4f4f5', borderRadius: 6, padding: '8 12', marginBottom: 4 },
  tableRow: { flexDirection: 'row', padding: '10 12', borderBottomWidth: 1, borderBottomColor: '#f4f4f5' },
  colDesc: { flex: 1 },
  colNum: { width: 60, textAlign: 'center' },
  colAmt: { width: 80, textAlign: 'right' },
  thText: { fontSize: 9, fontWeight: 'bold', color: '#71717a', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },
  tdText: { fontSize: 10, color: '#141414' },
  tdMuted: { fontSize: 10, color: '#71717a' },
  totals: { marginTop: 20, marginLeft: '55%' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  totalLabel: { fontSize: 10, color: '#71717a' },
  totalValue: { fontSize: 10, color: '#141414', fontFamily: 'Helvetica-Bold' },
  grandRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 2, borderTopColor: '#1D9E75', paddingTop: 10, marginTop: 8 },
  grandLabel: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#141414' },
  grandValue: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#1D9E75' },
  footer: { position: 'absolute', bottom: 36, left: 48, right: 48, borderTopWidth: 1, borderTopColor: '#e4e4e7', paddingTop: 14, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 8, color: '#a1a1aa' },
});

function PDFDoc({ invoiceId }: { invoiceId: string }) {
  const { getInvoice, settings } = useDataStore();
  const inv = getInvoice(invoiceId);
  if (!inv) return <Document><Page><Text>Not found</Text></Page></Document>;

  const typeLabel = { proforma: 'Pro-forma Invoice', final: 'Invoice', receipt: 'Receipt' }[inv.type];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            {settings.logo
              ? <Image src={settings.logo} style={{ width: 60, height: 60, objectFit: 'contain', marginBottom: 8 }} />
              : <View style={styles.logoBox}><Text style={styles.logoText}>RC</Text></View>
            }
            <Text style={[styles.companyName, { marginTop: 8 }]}>{settings.companyName}</Text>
            <Text style={styles.companyDetail}>{settings.poBox}</Text>
            <Text style={styles.companyDetail}>{settings.phone.join(' · ')}</Text>
            <Text style={styles.companyDetail}>{settings.emails[0]}</Text>
          </View>
          <View>
            <Text style={styles.invoiceLabel}>{typeLabel.toUpperCase()}</Text>
            <Text style={styles.invoiceNum}>{inv.number}</Text>
          </View>
        </View>

        {/* Meta */}
        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaTitle}>Billed To</Text>
            <Text style={styles.metaValue}>{inv.clientName}</Text>
            <Text style={[styles.metaValue, { color: '#71717a' }]}>{inv.clientAddress}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaTitle}>Invoice Details</Text>
            <Text style={styles.metaValue}>Date: {new Date(inv.date).toLocaleDateString('en-GH')}</Text>
            {inv.dueDate && <Text style={styles.metaValue}>Due: {new Date(inv.dueDate).toLocaleDateString('en-GH')}</Text>}
            <Text style={styles.metaValue}>Status: {inv.status}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.tableHeader}>
          <Text style={[styles.thText, styles.colDesc]}>Description</Text>
          <Text style={[styles.thText, styles.colNum]}>Qty</Text>
          <Text style={[styles.thText, styles.colAmt]}>Unit Cost</Text>
          <Text style={[styles.thText, styles.colAmt]}>Amount</Text>
        </View>
        {inv.items.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={[styles.tdText, styles.colDesc]}>{item.description}</Text>
            <Text style={[styles.tdMuted, styles.colNum]}>{item.qty}</Text>
            <Text style={[styles.tdMuted, styles.colAmt]}>{settings.currency} {item.unitCost.toFixed(2)}</Text>
            <Text style={[styles.tdText, styles.colAmt]}>{settings.currency} {(item.qty * item.unitCost).toFixed(2)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{settings.currency} {inv.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>VAT / NHIL (20%)</Text>
            <Text style={styles.totalValue}>{settings.currency} {inv.vat.toFixed(2)}</Text>
          </View>
          <View style={styles.grandRow}>
            <Text style={styles.grandLabel}>TOTAL DUE</Text>
            <Text style={styles.grandValue}>{settings.currency} {inv.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{settings.website}</Text>
          <Text style={styles.footerText}>{settings.companyName} · {settings.poBox}</Text>
          <Text style={styles.footerText}>{settings.phone[0]}</Text>
        </View>
      </Page>
    </Document>
  );
}

export default function InvoicePDF({ invoiceId }: { invoiceId: string }) {
  const { getInvoice } = useDataStore();
  const inv = getInvoice(invoiceId);
  if (!inv) return <p style={{ color: 'var(--text-muted)' }}>Invoice not found</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ padding: '16px 20px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
          <FileText size={18} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 600 }}>{inv.number}</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>· {inv.clientName} · {inv.status}</span>
        </div>
        <PDFDownloadLink
          document={<PDFDoc invoiceId={invoiceId} />}
          fileName={`${inv.number}.pdf`}
          className="btn btn-primary"
        >
          {({ loading }) => (
            <><Download size={16} /> {loading ? 'Generating…' : 'Download PDF'}</>
          )}
        </PDFDownloadLink>
      </div>
    </div>
  );
}
