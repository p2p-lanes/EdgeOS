import { PaymentsService } from "@edgeos/api-client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/lib/query-keys"
import { useApplication } from "@/providers/applicationProvider"
import { useDiscount } from "@/providers/discountProvider"
import { usePassesProvider } from "@/providers/passesProvider"
import type { AttendeePassState } from "@/types/Attendee"
import { filterProductsToPurchase } from "../helpers/filter"

const usePurchaseProducts = () => {
  const { getRelevantApplication } = useApplication()
  const { discountApplied } = useDiscount()
  const { isEditing, toggleEditing } = usePassesProvider()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (attendeePasses: AttendeePassState[]) => {
      const application = getRelevantApplication()
      if (!application) throw new Error("No application found")

      const monthSelectedWithWeekOrDay = attendeePasses.some(
        (p) =>
          p.products.some((p) => p.category === "month" && p.selected) &&
          (p.products.some((p) => p.category === "week" && p.purchased) ||
            p.products.some((p) => p.category.includes("day") && p.purchased)),
      )

      // LEGACY: application.credit removed from API
      const editableMode =
        (isEditing || monthSelectedWithWeekOrDay) &&
        !attendeePasses.some((p) =>
          p.products.some((p) => p.category === "patreon" && p.selected),
        )

      const productsPurchase = attendeePasses.flatMap((p) => p.products)
      const filteredProducts = filterProductsToPurchase(
        productsPurchase,
        editableMode,
      )

      const result = await PaymentsService.createMyPayment({
        requestBody: {
          application_id: String(application.id),
          products: filteredProducts.map((p: any) => ({
            product_id: String(p.id),
            attendee_id: String(p.attendee_id),
            quantity: p.quantity ?? 1,
          })),
          coupon_code: discountApplied.discount_code || null,
          edit_passes: editableMode,
        },
      })

      return { result, editableMode }
    },
    onSuccess: async ({ result, editableMode }) => {
      const isFastCheckout = window.location.href.includes("/checkout")
      const redirectUrl = isFastCheckout
        ? `${window.location.origin}/checkout/success`
        : window.location.href

      if ((result as any).status === "pending") {
        window.location.href = `${(result as any).checkout_url}?redirect_url=${redirectUrl}`
      } else if ((result as any).status === "approved") {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.applications.mine(),
        })
        await queryClient.invalidateQueries({
          queryKey: queryKeys.payments.all,
        })
        if (editableMode) {
          toggleEditing(false)
        }
        if (isFastCheckout) {
          window.location.href = redirectUrl
          return
        }
        toast.success(
          "Success! Your pass has been successfully updated. No additional payment was required.",
        )
      }
    },
  })

  const purchaseProducts = async (attendeePasses: AttendeePassState[]) => {
    const application = getRelevantApplication()
    if (!application) return
    return mutation.mutateAsync(attendeePasses)
  }

  return { purchaseProducts, loading: mutation.isPending }
}
export default usePurchaseProducts
