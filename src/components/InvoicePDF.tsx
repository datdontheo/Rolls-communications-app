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
  title: { fontSize: 28, fontWeight: 'bold', color: '#333333', fontFamily: 'Helvetica-Bold', marginBottom: 20 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 20 },
  metaBlock: { flex: 1 },
  metaLabel: { fontSize: 9, fontWeight: 'bold', color: '#666', letterSpacing: 0.5, textTransform: 'uppercase', fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  metaValue: { fontSize: 11, color: '#000' },
  metaDots: { borderBottomWidth: 1, borderBottomColor: '#ccc', borderBottomStyle: 'dotted', marginBottom: 2 },
  tableHeader: { flexDirection: 'row', borderTopWidth: 2, borderBottomWidth: 2, borderTopColor: '#000', borderBottomColor: '#000', paddingVertical: 8, marginTop: 16, marginBottom: 2, gap: 8 },
  tableRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#ccc', gap: 8 },
  colItem: { width: '22%' },
  colQty: { width: '12%', textAlign: 'center' },
  colDesc: { flex: 1 },
  colCost: { width: '18%', textAlign: 'right' },
  colAmt: { width: '18%', textAlign: 'right' },
  thText: { fontSize: 10, fontWeight: 'bold', color: '#000', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  tdText: { fontSize: 10, color: '#000' },
  tdMuted: { fontSize: 10, color: '#333' },
  totalsBox: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 8, borderWidth: 1, borderColor: '#000' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, fontSize: 10 },
  subtotalRow: { color: '#000' },
  vatRow: { color: '#000' },
  grandTotalRow: { borderTopWidth: 1, borderTopColor: '#000', paddingTopVertical: 8, fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#000' },
  footer: { position: 'absolute', bottom: 20, left: 40, right: 40, fontSize: 8, color: '#666', borderTopWidth: 1, borderTopColor: '#ccc', paddingTop: 10 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  signatureArea: { marginTop: 24, alignItems: 'flex-end' },
  signatureLine: { borderTopWidth: 1, borderTopColor: '#000', width: 120, marginTop: 20, fontSize: 8, color: '#666', marginBottom: 2 },
});

function PDFDoc({ invoiceId }: { invoiceId: string }) {
  const { getInvoice, settings } = useDataStore();
  const inv = getInvoice(invoiceId);
  if (!inv) return <Document><Page><Text>Not found</Text></Page></Document>;

  const typeLabel = { proforma: 'Pro-forma Invoice', final: 'Invoice', receipt: 'Receipt' }[inv.type];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Logo & Title */}
        <View style={styles.logoArea}>
          {settings.logo
            ? <Image src={settings.logo} style={styles.logo} />
            : <View style={styles.logoBox}><Text style={styles.logoText}>RC</Text></View>
          }
        </View>

        {/* Title */}
        <Text style={styles.title}>{typeLabel}</Text>

        {/* Client Info Row */}
        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>To:</Text>
            <Text style={[styles.metaValue, styles.metaDots]}>{inv.clientName}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Date:</Text>
            <Text style={styles.metaValue}>{new Date(inv.date).toLocaleDateString('en-GB')}</Text>
          </View>
        </View>

        {/* Address Row */}
        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Address:</Text>
            <Text style={[styles.metaValue, styles.metaDots]}>{inv.clientAddress}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.tableHeader}>
          <Text style={[styles.thText, { width: '20%' }]}>Item</Text>
          <Text style={[styles.thText, { width: '10%', textAlign: 'center' }]}>QNT</Text>
          <Text style={[styles.thText, { flex: 1 }]}>Description</Text>
          <Text style={[styles.thText, { width: '15%', textAlign: 'right' }]}>Unit Cost</Text>
          <Text style={[styles.thText, { width: '18%', textAlign: 'right' }]}>Amount {settings.currency}</Text>
        </View>

        {inv.items.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={[styles.tdText, { width: '20%' }]}>{item.description.split(' ').slice(0, 2).join(' ')}</Text>
            <Text style={[styles.tdMuted, { width: '10%', textAlign: 'center' }]}>{item.qty}</Text>
            <Text style={[styles.tdText, { flex: 1, fontSize: 9 }]}>{item.description}</Text>
            <Text style={[styles.tdMuted, { width: '15%', textAlign: 'right' }]}>{item.unitCost.toFixed(2)}</Text>
            <Text style={[styles.tdText, { width: '18%', textAlign: 'right' }]}>{(item.qty * item.unitCost).toFixed(2)}</Text>
          </View>
        ))}

        {/* Bottom border for table */}
        <View style={{ borderBottomWidth: 2, borderBottomColor: '#000', marginBottom: 16 }} />

        {/* Totals Box */}
        <View style={styles.totalsBox}>
          <View style={[styles.totalRow, styles.subtotalRow]}>
            <Text>SUBTOTAL</Text>
            <Text>{settings.currency} {inv.subtotal.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, styles.vatRow]}>
            <Text>VAT/NHIL {inv.vatRate} %</Text>
            <Text>{settings.currency} {inv.vat.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text>TOTAL</Text>
            <Text>{settings.currency} {inv.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Signature */}
        <View style={styles.signatureArea}>
          <Text style={{ fontSize: 9, color: '#666', marginBottom: 4 }}>Sign:...........................</Text>
        </View>

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

export default function InvoicePDF({ invoiceId }: { invoiceId: string }) {
  const { getInvoice } = useDataStore();
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const inv = getInvoice(invoiceId);
  if (!inv) return <p style={{ color: 'var(--text-muted)' }}>Invoice not found</p>;

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
          <span style={{ fontWeight: 600 }}>{inv.number}</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>· {inv.clientName} · {inv.status}</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handlePreview} className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Eye size={16} /> Preview
          </button>
          <PDFDownloadLink
            document={<PDFDoc invoiceId={invoiceId} />}
            fileName={`${inv.number}.pdf`}
            className="btn btn-primary"
          >
            {({ loading }) => (
              <><Download size={16} /> {loading ? 'Generating…' : 'Download'}</>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      <Modal isOpen={showPreview} title={`Preview: ${inv.number}`} onClose={() => setShowPreview(false)}>
        <div style={{ height: '600px', backgroundColor: '#f5f5f5', borderRadius: 8, overflow: 'hidden' }}>
          {previewUrl && (
            <iframe
              src={previewUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Invoice Preview"
            />
          )}
        </div>
      </Modal>
    </>
  );
}
