import { ButtonAnimated } from "@/components/ui/button"
import { usePassesProvider } from "@/providers/passesProvider";
import usePurchaseProducts from "../../../hooks/usePurchaseProducts";

const CompletePurchaseButton = () => {
  const { purchaseProducts, loading } = usePurchaseProducts();
  const { attendeePasses: attendees } = usePassesProvider()
  const someSelected = attendees.some(attendee => attendee.products.some(product => product.selected && !product.purchased))

  return (
    <ButtonAnimated
      disabled={loading || !someSelected} 
      loading={loading} 
      className="w-full md:w-fit text-white bg-slate-800" 
      onClick={() => purchaseProducts(attendees)}
      data-purchase
    >
      {loading ? 'Purchasing...' : 'Proceed to Payment'}
    </ButtonAnimated>

  )
}
export default CompletePurchaseButton