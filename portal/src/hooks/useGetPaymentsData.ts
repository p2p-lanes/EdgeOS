import { PaymentsService } from "@edgeos/api-client"
import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { useApplication } from "@/providers/applicationProvider"
import type { PaymentsProps } from "@/types/passes"

function mapPayment(p: any): PaymentsProps {
  return {
    id: Number(p.id),
    application_id: Number(p.application_id),
    external_id: p.external_id ?? null,
    status: (p.status ?? "pending") as PaymentsProps["status"],
    amount: Number(p.amount ?? 0),
    rate: Number(p.rate ?? 0),
    source: p.source ?? null,
    currency: p.currency ?? "USD",
    checkout_url: p.checkout_url ?? null,
    products_snapshot: (p.products_snapshot ?? []).map((ps: any) => ({
      product_id: Number(ps.product_id),
      attendee_id: Number(ps.attendee_id),
      quantity: ps.quantity ?? 1,
      product_name: ps.product_name ?? "",
      product_description: ps.product_description ?? null,
      product_price: Number(ps.product_price ?? 0),
      product_category: ps.product_category ?? "",
      created_at: ps.created_at ?? "",
    })),
    created_at: p.created_at ?? "",
    updated_at: p.updated_at ?? "",
  }
}

const useGetPaymentsData = () => {
  const { getRelevantApplication } = useApplication()
  const application = getRelevantApplication()

  const { data: payments = [] } = useQuery({
    queryKey: queryKeys.payments.byApp(String(application?.id ?? "")),
    queryFn: async () => {
      const result = await PaymentsService.listMyPayments({
        applicationId: String(application!.id),
      })
      return result.results.map(mapPayment)
    },
    enabled: !!application?.id,
  })

  return { payments }
}
export default useGetPaymentsData
