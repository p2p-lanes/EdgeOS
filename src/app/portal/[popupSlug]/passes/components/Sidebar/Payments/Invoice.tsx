import { pdf, Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 12,
    padding: 30,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 21,
    gap: 2,
    display: 'flex',
  },
  table: {
    display: 'flex',
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    flex: 1,
    padding: 6,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  tableHeader: {
    backgroundColor: '#eee',
    fontWeight: 'bold',
  },
  logo: {
    width: '100%',
    height: 'auto',
    maxHeight: '130px',
    objectFit: 'cover',
    marginBottom: 10,
  },
  footer: {
    marginTop: 20,
    textAlign: 'right',
  },
});

// Componente del PDF
export const Invoice = ({ invoiceData }: { invoiceData: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Logo */}
      <Image src={invoiceData.logoUrl} style={styles.logo} />

      {/* Invoice Info */}
      <View style={[styles.section, {flexDirection: 'row', justifyContent: 'space-between'}]}>
        <View style={{display: 'flex', flexDirection: 'column', gap: 4, flex: 1}}>
          <Text>{invoiceData.companyName}</Text>
          <Text>Address: {invoiceData.companyAddress}</Text>
          <Text>Email: {invoiceData.companyEmail}</Text>
        </View>
        <View style={{display: 'flex', flexDirection: 'column', gap: 4, flex: 1, alignItems: 'flex-end'}}>
          <Text>Date: {invoiceData.date}</Text>
          <Text>Invoice #: {invoiceData.invoiceNumber}</Text>
          <Text>Client: {invoiceData.clientName}</Text>
        </View>
      </View>

      {/* Table */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.tableCell}>Description</Text>
          <Text style={styles.tableCell}>Rate</Text>
          <Text style={styles.tableCell}>Amount</Text>
        </View>
        {/* Table Rows */}
        {invoiceData.items.map((item: any, index: any) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{item.description}</Text>
            <Text style={styles.tableCell}>{item.rate}</Text>
            <Text style={styles.tableCell}>{item.amount}</Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={{fontWeight: 'bold', fontFamily: 'Helvetica-Bold'}}>Total: {invoiceData.total} USDC</Text>
      </View>
    </Page>
  </Document>
);