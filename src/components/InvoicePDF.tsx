import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useDataStore } from '../stores/dataStore';
import { Download } from 'lucide-react';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1D9E75',
    paddingBottom: 15,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D9E75',
    marginBottom: 5,
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 10,
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
    fontSize: 11,
  },
  label: {
    fontWeight: 'bold',
    color: '#1A1A1A',
    width: '30%',
  },
  value: {
    color: '#6B6B6B',
    flex: 1,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1D9E75',
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11,
    padding: 8,
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: 'row',
    fontSize: 10,
    paddingTop: 5,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E3DE',
  },
  tableCell: {
    paddingHorizontal: 5,
  },
  totalsSection: {
    marginTop: 20,
    marginLeft: '60%',
    fontSize: 11,
  },
  totalRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingBottom: 8,
  },
  totalLabel: {
    width: '60%',
    fontWeight: 'bold',
  },
  totalValue: {
    textAlign: 'right',
    fontWeight: 'bold',
  },
  grandTotal: {
    flexDirection: 'row',
    borderTopWidth: 2,
    borderTopColor: '#1D9E75',
    paddingTop: 8,
    marginTop: 8,
    fontSize: 12,
  },
  footer: {
    marginTop: 40,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E3DE',
    textAlign: 'center',
    fontSize: 9,
    color: '#6B6B6B',
  },
});

interface InvoicePDFProps {
  invoiceId: string;
}

function InvoicePDFDocument({ invoiceId }: InvoicePDFProps) {
  const { getInvoice, settings } = useDataStore();
  const invoice = getInvoice(invoiceId);

  if (!invoice) {
    return <Document><Page><Text>Invoice not found</Text></Page></Document>;
  }

  const invoiceTypeLabel = {
    proforma: 'Pro-forma Invoice',
    final: 'Invoice',
    receipt: 'Receipt',
  }[invoice.type];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {settings.logo && (
            <Image
              src={settings.logo}
              style={styles.logo}
            />
          )}
          <Text style={styles.companyName}>{settings.companyName}</Text>
          <Text style={styles.invoiceTitle}>{invoiceTypeLabel}</Text>
        </View>

        {/* Invoice Details */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Invoice #:</Text>
            <Text style={styles.value}>{invoice.number}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{new Date(invoice.date).toLocaleDateString()}</Text>
          </View>
          {invoice.dueDate && (
            <View style={styles.row}>
              <Text style={styles.label}>Due Date:</Text>
              <Text style={styles.value}>{new Date(invoice.dueDate).toLocaleDateString()}</Text>
            </View>
          )}
        </View>

        {/* Bill To */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BILL TO:</Text>
          <View style={styles.row}>
            <Text style={styles.value}>{invoice.clientName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.value}>{invoice.clientAddress}</Text>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={{ ...styles.tableCell, width: '45%' }}>Description</Text>
            <Text style={{ ...styles.tableCell, width: '15%', textAlign: 'center' }}>Qty</Text>
            <Text style={{ ...styles.tableCell, width: '20%', textAlign: 'right' }}>Unit Cost</Text>
            <Text style={{ ...styles.tableCell, width: '20%', textAlign: 'right' }}>Amount</Text>
          </View>

          {invoice.items.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={{ ...styles.tableCell, width: '45%' }}>{item.description}</Text>
              <Text style={{ ...styles.tableCell, width: '15%', textAlign: 'center' }}>{item.qty}</Text>
              <Text style={{ ...styles.tableCell, width: '20%', textAlign: 'right' }}>{settings.currency} {item.unitCost.toFixed(2)}</Text>
              <Text style={{ ...styles.tableCell, width: '20%', textAlign: 'right' }}>{settings.currency} {(item.qty * item.unitCost).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{settings.currency} {invoice.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>VAT/NHIL 20%:</Text>
            <Text style={styles.totalValue}>{settings.currency} {invoice.vat.toFixed(2)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text style={styles.totalLabel}>TOTAL:</Text>
            <Text style={styles.totalValue}>{settings.currency} {invoice.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>{settings.companyName} | P.O. Box {settings.poBox}</Text>
          <Text>Tel: {settings.phone.join(' | ')} | Email: {settings.emails[0]}</Text>
          <Text>Website: {settings.website}</Text>
        </View>
      </Page>
    </Document>
  );
}

export default function InvoicePDF({ invoiceId }: InvoicePDFProps) {
  const { getInvoice } = useDataStore();
  const invoice = getInvoice(invoiceId);

  if (!invoice) return <div>Invoice not found</div>;

  return (
    <div className="space-y-4">
      <PDFDownloadLink
        document={<InvoicePDFDocument invoiceId={invoiceId} />}
        fileName={`${invoice.number}.pdf`}
        className="inline-flex items-center gap-2 btn-primary"
      >
        {({ loading }) => (
          <>
            <Download size={18} />
            {loading ? 'Generating PDF...' : 'Download PDF'}
          </>
        )}
      </PDFDownloadLink>
    </div>
  );
}
