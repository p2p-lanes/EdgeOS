import { Button, ButtonAnimated } from "@/components/ui/button"
import { useTotal } from "@/providers/totalProvider"
import usePurchaseProducts from "../../hooks/usePurchaseProducts";
import { usePassesProvider } from "@/providers/passesProvider";

const TotalFloatingBar = ({ setOpenCart }: { setOpenCart: (prev: boolean) => void }) => {
  const { originalTotal, total } = useTotal()
  const { purchaseProducts, loading } = usePurchaseProducts();
  const { attendeePasses: attendees } = usePassesProvider()

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
        <Button variant="outline" className="w-[120px]" onClick={handleOnClickReviewOrder}>
          Review Order
        </Button>
        <ButtonAnimated variant="default" className="w-[120px]" loading={loading} disabled={loading} onClick={() => purchaseProducts(attendees)}>
          Pay
        </ButtonAnimated>
      </div>
    </div>
  )
}
export default TotalFloatingBar