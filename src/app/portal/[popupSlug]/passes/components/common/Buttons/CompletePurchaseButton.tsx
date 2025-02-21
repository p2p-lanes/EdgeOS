import { ButtonAnimated } from "@/components/ui/button"
import { usePassesProvider } from "@/providers/passesProvider";
import usePurchaseProducts from "../../../hooks/usePurchaseProducts";

const CompletePurchaseButton = ({edit}: {edit?: boolean}) => {
  const { purchaseProducts, loading } = usePurchaseProducts();
  const { attendeePasses: attendees } = usePassesProvider()
  const someSelected = attendees.some(attendee => attendee.products.some(product => product.selected && !product.purchased))

  return (
    <ButtonAnimated
      disabled={loading || !someSelected} 
      loading={loading} 
      className="w-full md:w-fit md:min-w-[120px] text-white bg-slate-800" 
      onClick={() => purchaseProducts(attendees)}
      data-purchase
    >
      {loading ? 'Loading...' : edit ? 'Confirm' : 'Proceed to Payment'}
    </ButtonAnimated>

  )
}
export default CompletePurchaseButton