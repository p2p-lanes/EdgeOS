import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, Download } from "lucide-react"
import { PaymentsProps } from "@/types/passes"
import { Invoice } from "./Invoice"
import { pdf } from "@react-pdf/renderer"
import { saveAs } from 'file-saver';
import { useCityProvider } from "@/providers/cityProvider"
import { useApplication } from "@/providers/applicationProvider"
import { formatDate } from "@/helpers/dates"

const PaymentHistory = ({payments}: {payments: PaymentsProps[]}) => {
  const { getCity } = useCityProvider()
  const { getRelevantApplication } = useApplication()
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
    
    const clientName = application.first_name + ' ' + application.last_name
    const blob = await pdf(<Invoice 
        payment={payment} 
        imageUrl={city?.image_url} 
        clientName={clientName} 
        discount={0} 
        hasPatreon={application.attendees.some(attendee => 
          attendee.products?.some(product => product.category === 'patreon')
        )}
      />).toBlob();
    saveAs(blob, `${clientName}-invoice.pdf`);
  }

  return(
    <Card className="w-full">
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