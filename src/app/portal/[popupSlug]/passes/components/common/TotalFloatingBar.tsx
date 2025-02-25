import { Button, ButtonAnimated } from "@/components/ui/button"
import { useTotal } from "@/providers/totalProvider"
import usePurchaseProducts from "../../hooks/usePurchaseProducts";
import { usePassesProvider } from "@/providers/passesProvider";
import { Loader2 } from "lucide-react";

const TotalFloatingBar = ({ setOpenCart }: { setOpenCart: (prev: boolean) => void }) => {
  const { originalTotal, total } = useTotal()
  const { purchaseProducts, loading } = usePurchaseProducts();
  const { attendeePasses: attendees } = usePassesProvider()
  const someSelected = attendees.some(attendee => attendee.products.some(product => product.selected && !product.purchased))

  const handleOnClickReviewOrder = () => {
    setOpenCart(true)
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }, 210)
  }

  return (
    <div className="flex justify-between items-center">
      <div className="flex justify-center items-center gap-2">
        <p className="text-sm font-medium">Total</p>
        {
          originalTotal > 0 && originalTotal !== total && (
            <span className=" text-muted-foreground line-through">${originalTotal.toFixed(0)}</span>
          )
        }
        <span className="font-medium">{total > 0 ? `$${total.toFixed(2)}` : '$0'}</span>
      </div>

      <div className="flex justify-center items-center gap-2">
        <Button variant="outline" className="p-5 whitespace-nowrap" onClick={handleOnClickReviewOrder}>
          Review Order
        </Button>
        <Button variant="default" className="p-5 whitespace-nowrap" disabled={loading || !someSelected} onClick={() => purchaseProducts(attendees)}>
          {
            loading && <Loader2 className="size-4 animate-spin" />
          }
          {total <= 0 ? 'Confirm' : 'Confirm and Pay'}
        </Button>
      </div>
    </div>
  )
}
export default TotalFloatingBar