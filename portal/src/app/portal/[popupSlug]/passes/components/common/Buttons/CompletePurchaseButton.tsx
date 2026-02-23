import { ButtonAnimated } from "@/components/ui/button"
import { usePassesProvider } from "@/providers/passesProvider"
import usePurchaseProducts from "../../../hooks/usePurchaseProducts"

const CompletePurchaseButton = ({
  edit,
  waiverAccepted = true,
}: {
  edit?: boolean
  waiverAccepted?: boolean
}) => {
  const { purchaseProducts, loading } = usePurchaseProducts()
  const { attendeePasses: attendees } = usePassesProvider()
  const someSelected = attendees.some((attendee) =>
    attendee.products.some(
      (product) =>
        product.selected &&
        (product.purchased ? product.category === "day" : true),
    ),
  )

  return (
    <ButtonAnimated
      disabled={loading || !someSelected || !waiverAccepted}
      loading={loading}
      className="w-full md:w-fit md:min-w-[120px] text-white bg-slate-800"
      onClick={() => purchaseProducts(attendees)}
      data-purchase
    >
      {loading ? "Loading..." : edit ? "Confirm" : "Confirm and Pay"}
    </ButtonAnimated>
  )
}
export default CompletePurchaseButton
