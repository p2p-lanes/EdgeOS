import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-EN', {day: 'numeric', month: 'numeric', year: 'numeric'})
}

const PaymentHistory = ({payments}: {payments: any[]}) => {
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

  return(
    <Card className=" w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {approvedPayments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{formatDate(payment.created_at)}</TableCell>
              <TableCell>{payment.status}</TableCell>
              <TableCell>{payment.currency}</TableCell>
              <TableCell>$ {payment.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )


}

export default PaymentHistory