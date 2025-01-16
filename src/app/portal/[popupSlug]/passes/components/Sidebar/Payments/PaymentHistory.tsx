import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, Download } from "lucide-react"
import { PaymentsProps } from "@/types/passes"
import { Invoice } from "./Invoice"
import { pdf } from "@react-pdf/renderer"
import { saveAs } from 'file-saver';
import { useCityProvider } from "@/providers/cityProvider"

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-EN', {day: 'numeric', month: 'numeric', year: 'numeric'})
}

const PaymentHistory = ({payments}: {payments: PaymentsProps[]}) => {
  const { getCity, getRelevantApplication } = useCityProvider()
  const application = getRelevantApplication()
  const city = getCity()
  const approvedPayments = payments?.filter(payment => payment.status === 'approved')

  if(!approvedPayments || approvedPayments.length === 0){
    return (
      <Card className="p-6 space-y-6 w-full">
        <div className="text-center text-muted-foreground py-8">
          No payment history available
        </div>
      </Card>
    )
  }

  const handleDownloadInvoice = async (payment: PaymentsProps) => {
    if(!application) return
    const invoiceData = {
      logoUrl: city?.image_url, // URL del logo
      companyName: 'Edge Institute Inc',
      companyAddress: '1300 S 6th St, Austin, TX 78704',
      companyEmail: 'allison@edgecity.live',
      date: formatDate(payment.created_at),
      invoiceNumber: payment.id,
      clientName: application.first_name + ' ' + application.last_name,
      items: payment.products_snapshot.map((product) => ({
        description: product.product_name,
        rate: '',
        amount: product.product_price.toString()
      })),
      total: payment.amount.toString(),
    };

    // Genera el PDF como un blob
    const blob = await pdf(<Invoice invoiceData={invoiceData} />).toBlob();
    // Usa file-saver para descargar el archivo
    saveAs(blob, 'invoice.pdf');
  }

  return(
    <Card className=" w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Invoice</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {approvedPayments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell><Check className="text-green-500 w-4 h-4" /></TableCell>
              <TableCell className="text-left">{formatDate(payment.created_at)}</TableCell>
              <TableCell>{payment.currency}</TableCell>
              <TableCell>$ {payment.amount}</TableCell>
              <TableCell>
                {
                  payment.amount > 0 && (
                    <Button variant="ghost" size="icon" onClick={() => handleDownloadInvoice(payment)}>
                      <Download className="w-4 h-4" />
                    </Button>
                  )
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )


}

export default PaymentHistory