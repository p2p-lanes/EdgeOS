import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, Download } from "lucide-react"

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-EN', {day: 'numeric', month: 'numeric', year: 'numeric'})
}

const PaymentHistory = ({payments}: {payments: any[]}) => {
  const approvedPayments = payments?.filter(payment => payment.status === 'approved' && payment.amount > 0)

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
              <TableCell><Button variant="ghost" size="icon"><Download className="w-4 h-4" /></Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )


}

export default PaymentHistory