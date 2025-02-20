import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { ChevronRight, Tag } from "lucide-react"
import { AttendeeProps } from "@/types/Attendee"
import { DiscountProps } from "@/types/discounts"
import useDiscountCode from "../../hooks/useDiscountCode"
import ProductCart from "./Products/ProductCart"
import { useTotal } from "@/providers/totalProvider"

const TotalPurchase = ({ attendees, isModal, isOpen, setIsOpen }: {attendees: AttendeeProps[], isModal?: boolean, isOpen: boolean, setIsOpen: (prev: boolean) => void}) => {
  const { discountApplied } = useDiscountCode()
  const { originalTotal, total, discountAmount } = useTotal()
  

  const productsCart = attendees.flatMap(attendee => attendee.products.filter(p => p.selected && p.category !== 'month')).sort((a, b) => {
    if (a.category === 'patreon') return -1
    if (b.category === 'patreon') return 1
    return 0
  })

  const patreonSelected = attendees.some(attendee => attendee.products.some(p => p.selected && p.category === 'patreon'))

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="space-y-4 pt-0"
      data-cart
    >
      <CollapsibleTrigger className={cn("w-full bg-neutral-200 rounded-md", isModal && "bg-transparent")}>
        <div className="flex justify-between items-center p-3">
          <div className="flex items-center gap-2">
            <ChevronRight 
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isOpen && "transform rotate-90"
              )}
            />
            <span className="font-medium">Total</span>
          </div>
          
          <div className="flex items-center gap-2">
            {originalTotal > 0 && originalTotal !== total && (
              <span className="text-xs text-muted-foreground line-through">
                ${originalTotal.toFixed(2)}
              </span>
            )}
            <span className="font-medium" data-total={total.toFixed(2)}>${total > 0 ? total.toFixed(2) : 0}</span>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="transition-all duration-100 ease-in-out data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown">
        {productsCart.length > 0 ? (
          <div className="space-y-2 px-3">
            {
              productsCart.map(product => <ProductCart key={product.id} product={product}/>)
            }

           <DiscountMonth attendees={attendees} total={total}/>

            <DiscountCouponTotal discountAmount={discountAmount} discountApplied={discountApplied} patreonSelected={patreonSelected} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground px-3">
            No passes selected
          </p>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}

const DiscountCouponTotal = ({ discountAmount, discountApplied, patreonSelected }: {
  discountAmount: number,
  discountApplied: DiscountProps,
  patreonSelected: boolean
}) => {

  if(!discountApplied.discount_value || discountAmount === 0) return null

  const getLabelDiscount = () => {
    if(patreonSelected){
      return 'Patron Free Tickets'
    }
    if(discountApplied.discount_code){
      return `${discountApplied.discount_code } (${discountApplied.discount_value}% OFF)`
    }
    return `Award ${discountApplied.discount_value}% OFF`
  }

  if(discountAmount > 0){
    return(
      <div className="flex justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
        <Tag className="w-4 h-4" />
        <span className="text-sm text-muted-foreground">
          {getLabelDiscount()}
        </span>
      </div>
        <span data-discount-amount={discountAmount.toFixed(2)}> - ${discountAmount.toFixed(2)}</span>
      </div>
    )
  }

  return null
}

const DiscountMonth = ({ attendees, total }: { attendees: AttendeeProps[], total: number }) => {

  const calculateDiscountMonth = () => {
    const totalPrice = attendees.reduce((total, attendee) => {
      return total + attendee.products
        .filter(p => p.selected && p.category === 'week')
        .reduce((sum, product) => sum + (product.compare_price ?? 0), 0)
    }, 0)

    return totalPrice - total
  }

  const hasMonthSelected = attendees.some(attendee => attendee.products.some(p => p.selected && p.category === 'month'))

  if(!hasMonthSelected) return null

  const discountMonth = calculateDiscountMonth()

  if(discountMonth <= 0) return null

  return (
     <div className="flex justify-between text-sm text-muted-foreground">
        <span className="flex items-center gap-2"><Tag className="w-4 h-4" />Discount on Full Month</span>
        <span data-month-discount={discountMonth}> - ${discountMonth}</span>
      </div>
  )
}
export default TotalPurchase