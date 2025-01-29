import { formatDate } from '@/helpers/dates';
import { PaymentsProps, ProductsSnapshotProps } from '@/types/passes';
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
    padding: 4,
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
  tableCellMini: {
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000',
    width: '60px',
  }
});

interface InvoiceProps {
  payment: PaymentsProps
  discount?: number
  hasPatreon?: boolean
  imageUrl?: string
  clientName: string
}

// Componente del PDF
export const Invoice = ({ payment, discount, hasPatreon, imageUrl, clientName }: InvoiceProps) => {

  const total = payment.rate > 1 ? (payment.amount / payment.rate).toFixed(8) : payment.amount

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image src={imageUrl} style={styles.logo} />

      <View style={[styles.section, {flexDirection: 'row', justifyContent: 'space-between'}]}>
        <View style={{display: 'flex', flexDirection: 'column', gap: 4, flex: 1}}>
          <Text>Edge Institute Inc</Text>
          <Text>Address: 1300 S 6th St, Austin, TX 78704</Text>
          <Text>Email: allison@edgecity.live</Text>
        </View>
        <View style={{display: 'flex', flexDirection: 'column', gap: 4, flex: 1, alignItems: 'flex-end'}}>
          <Text>Date: {formatDate(payment.created_at)}</Text>
          <Text>Invoice #: {payment.id}</Text>
          <Text>Bill to: {clientName}</Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.tableCellMini}>Quantity</Text>
          <Text style={styles.tableCell}>Description</Text>
          <Text style={styles.tableCell}>Unit Price</Text>
          {
            discount && !hasPatreon && (
              <Text style={styles.tableCell}>Discount</Text>
            )
          }
          {
            payment.rate > 1 && (
              <Text style={styles.tableCell}>Rate</Text>
            )
          }
          <Text style={styles.tableCell}>Amount</Text>
        </View>
        {payment.products_snapshot.map((item: ProductsSnapshotProps, index: number) => {
          const unitPrice = payment.rate > 1 ? (item.product_price / payment.rate).toFixed(8) : item.product_price
          const totalUnit = Number(unitPrice) * item.quantity
          const totalDiscount = discount ? (totalUnit * (1 - discount / 100)) : totalUnit
          return(
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCellMini}>{item.quantity}</Text>
              <Text style={styles.tableCell}>{item.product_name}</Text>
              <Text style={styles.tableCell}>{item.product_price} USD</Text>
              {
                discount && !hasPatreon && (
                  <Text style={styles.tableCell}>{discount}%</Text>
                )
              }
              {
                payment.rate > 1 && (
                  <Text style={styles.tableCell}> 1 {payment.currency} = {payment.rate} USD </Text>
                )
              }
              <Text style={styles.tableCell}>{totalDiscount} {payment.currency}</Text>
            </View>
          )
        })}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={{fontWeight: 'bold', fontFamily: 'Helvetica-Bold'}}>
          Total: {total} {payment.currency}
        </Text>
      </View>
    </Page>
  </Document>
  )
};