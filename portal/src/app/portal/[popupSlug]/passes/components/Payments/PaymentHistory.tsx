import { pdf } from "@react-pdf/renderer"
import { saveAs } from "file-saver"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "@/helpers/dates"
import { useApplication } from "@/providers/applicationProvider"
import { useCityProvider } from "@/providers/cityProvider"
import type { PaymentsProps } from "@/types/passes"
import { Invoice } from "./Invoice"

const PaymentHistory = ({ payments }: { payments: PaymentsProps[] }) => {
  const { getCity } = useCityProvider()
  const { getRelevantApplication } = useApplication()
  const application = getRelevantApplication()
  const city = getCity()
  const approvedPayments = payments?.filter(
    (payment) => payment.status === "approved",
  )

  if (!approvedPayments || approvedPayments.length === 0) {
    return (
      <Card className="p-6 space-y-6 w-full">
        <div className="text-center text-muted-foreground py-8">
          No payment history available
        </div>
      </Card>
    )
  }

  const handleDownloadInvoice = async (payment: PaymentsProps) => {
    if (!application) return

    // LEGACY: first_name, last_name, discount_assigned removed from ApplicationPublic
    const clientName = application.human
      ? `${application.human.first_name ?? ""} ${application.human.last_name ?? ""}`.trim()
      : "Unknown"
    const blob = await pdf(
      <Invoice
        payment={payment}
        imageUrl={city?.image_url ?? undefined}
        clientName={clientName}
        discount={undefined}
        hasPatreon={(application.attendees ?? []).some((attendee) =>
          (attendee.products as any[])?.some(
            (product: any) => product.category === "patreon",
          ),
        )}
      />,
    ).toBlob()
    saveAs(blob, `${clientName}-invoice.pdf`)
  }

  return (
    <Card className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Invoice</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {approvedPayments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="text-left">
                {formatDate(payment.created_at)}
              </TableCell>
              <TableCell>{payment.currency}</TableCell>
              <TableCell>$ {payment.amount}</TableCell>
              <TableCell>
                {payment.amount > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownloadInvoice(payment)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

export default PaymentHistory
