import { useState } from 'react';
import { Document, Page, Text, View, StyleSheet, Image, pdf } from '@react-pdf/renderer';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useDataStore } from '../stores/dataStore';
import { Download, FileText, Eye } from 'lucide-react';
import Modal from './Modal';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#FFFFFF', fontSize: 11 },
  logoArea: { alignItems: 'center', marginBottom: 24, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#000' },
  logo: { width: 80, height: 60, objectFit: 'contain', marginBottom: 8 },
  logoBox: { width: 80, height: 60, backgroundColor: '#1D9E75', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'Helvetica-Bold' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#16a34a', fontFamily: 'Helvetica-Bold', marginBottom: 20, textAlign: 'center' },
  badgeReceived: { fontSize: 13, fontWeight: 'bold', color: '#16a34a', fontFamily: 'Helvetica-Bold', marginBottom: 16, textAlign: 'center', padding: '8 12' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 20 },
  metaBlock: { flex: 1 },
  metaLabel: { fontSize: 9, fontWeight: 'bold', color: '#666', letterSpacing: 0.5, textTransform: 'uppercase', fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  metaValue: { fontSize: 11, color: '#000' },
  metaDots: { borderBottomWidth: 1, borderBottomColor: '#ccc', borderBottomStyle: 'dotted', marginBottom: 2 },
  section: { marginTop: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#000', fontFamily: 'Helvetica-Bold', marginBottom: 10, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: '#000' },
  tableRow: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  colDesc: { flex: 1 },
  colQty: { width: '60px', textAlign: 'center' },
  colAmt: { width: '100px', textAlign: 'right' },
  tdText: { fontSize: 10, color: '#000' },
  tdMuted: { fontSize: 10, color: '#666' },
  totalsBox: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 8, borderWidth: 1, borderColor: '#000' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, fontSize: 10 },
  grandTotalRow: { borderTopWidth: 1, borderTopColor: '#000', paddingTopVertical: 8, fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#000' },
  footer: { position: 'absolute', bottom: 20, left: 40, right: 40, fontSize: 8, color: '#666', borderTopWidth: 1, borderTopColor: '#ccc', paddingTop: 10 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  thankYou: { marginTop: 16, textAlign: 'center', fontSize: 10, color: '#666', fontStyle: 'italic' },
});

function PDFDoc({ invoiceId }: { invoiceId: string }) {
  const { getInvoice, settings } = useDataStore();
  const inv = getInvoice(invoiceId);

  if (!inv) return <Document><Page><Text>Not found</Text></Page></Document>;

  const receiptDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const invoiceDate = new Date(inv.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <Document title={`Receipt-${inv.number}`}>
      <Page size="A4" style={styles.page}>
        {/* Logo & Title */}
        <View style={styles.logoArea}>
          {settings.logo
            ? <Image src={settings.logo} style={styles.logo} />
            : <View style={styles.logoBox}><Text style={styles.logoText}>RC</Text></View>
          }
        </View>

        {/* Title */}
        <Text style={styles.title}>PAYMENT RECEIVED</Text>
        <Text style={styles.badgeReceived}>✓ PAID IN FULL</Text>

        {/* Client Info */}
        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Bill To:</Text>
            <Text style={[styles.metaValue, styles.metaDots]}>{inv.clientName}</Text>
            <Text style={styles.metaValue}>{inv.clientAddress}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Invoice:</Text>
            <Text style={styles.metaValue}>{inv.number}</Text>
            <Text style={[styles.metaLabel, { marginTop: 8 }]}>Invoice Date:</Text>
            <Text style={styles.metaValue}>{invoiceDate}</Text>
            <Text style={[styles.metaLabel, { marginTop: 8 }]}>Receipt Date:</Text>
            <Text style={styles.metaValue}>{receiptDate}</Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {inv.items.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <View style={styles.colDesc}>
                <Text style={styles.tdText}>{item.item}</Text>
                <Text style={[styles.tdMuted, { fontSize: 9 }]}>{item.description}</Text>
              </View>
              <Text style={[styles.tdMuted, styles.colQty]}>{item.qty}</Text>
              <Text style={[styles.tdText, styles.colAmt]}>{(item.qty * item.unitCost).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{inv.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>VAT/NHIL {inv.vatRate}%</Text>
            <Text>{inv.vat.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text>Amount Received</Text>
            <Text>{inv.total.toFixed(2)} {settings.currency}</Text>
          </View>
        </View>

        {/* Thank You */}
        <Text style={styles.thankYou}>Thank you for your payment. This receipt confirms payment in full.</Text>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <View style={styles.footerRow}>
            <Text>Po. box 108 Teshie Accra</Text>
            <Text>Tel: {settings.phone.join(', ')}</Text>
          </View>
          <View style={styles.footerRow}>
            <Text>Email: {settings.emails.join(', ')}</Text>
            <Text>{settings.website}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export default function PaymentReceiptPDF({ invoiceId }: { invoiceId: string }) {
  const { getInvoice } = useDataStore();
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const inv = getInvoice(invoiceId);

  if (!inv) return <div style={{ color: '#dc2626' }}>Invoice not found</div>;

  const handlePreview = async () => {
    try {
      const blob = await pdf(<PDFDoc invoiceId={invoiceId} />).toBlob();
      setPreviewUrl(URL.createObjectURL(blob));
      setShowPreview(true);
    } catch (err) {
      console.error('Preview error:', err);
    }
  };

  return (
    <>
      <div style={{ padding: '16px 20px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
          <FileText size={18} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 600 }}>Receipt for {inv.number}</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>· {inv.clientName} · Paid</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handlePreview} className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Eye size={16} /> Preview
          </button>
          <PDFDownloadLink
            document={<PDFDoc invoiceId={invoiceId} />}
            fileName={`Receipt-${inv.number}.pdf`}
            className="btn btn-primary"
          >
            {({ loading }) => (
              <><Download size={16} /> {loading ? 'Generating…' : 'Download'}</>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      <Modal isOpen={showPreview} title={`Receipt Preview: ${inv.number}`} onClose={() => setShowPreview(false)}>
        <div style={{ height: '600px', backgroundColor: '#f5f5f5', borderRadius: 8, overflow: 'hidden' }}>
          {previewUrl && (
            <iframe
              src={previewUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Receipt Preview"
            />
          )}
        </div>
      </Modal>
    </>
  );
}
