import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { ProductsPass } from "@/types/Products"
import { ChevronRight, Tag } from "lucide-react"
import { useMemo, useState } from "react"
import { badgeName } from "../../../../constants/multiuse"
import { AttendeeProps } from "@/types/Attendee"
import useDiscountCode from "../../../../hooks/useDiscountCode"
import { calculateTotal } from "../../../../helpers/products"

const TotalPurchase = ({attendees }: {
  attendees: AttendeeProps[],
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const { discountApplied } = useDiscountCode()
  const productsCart = attendees.flatMap(attendee => attendee.products.filter(p => p.selected && p.category !== 'month'))

  const patreonSelected = attendees.some(attendee => attendee.products.some(p => p.selected && p.category === 'patreon'))

  const { originalTotal, total, discountAmount } = calculateTotal(attendees, discountApplied)

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="space-y-4 pt-0"
    >
      <CollapsibleTrigger className="w-full">
        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
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
            <span className="font-medium">${total.toFixed(2)}</span>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {productsCart.length > 0 ? (
          <div className="space-y-2 px-3">
            {
              productsCart.map(product => (
                <div key={`${product.id}-${product.name}`} className="flex justify-between text-sm text-muted-foreground">
                  <span>1 x {product.name} ({badgeName[product.attendee_category] || product.attendee_category})</span>
                  <span>${product.original_price?.toFixed(2)}</span>
                </div>
              ))
            }

            {
              discountAmount > 0 && !patreonSelected && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    <span className="text-xs">{discountApplied.discount_code} ({discountApplied.discount_value}% OFF)</span>
                  </div>
                  <span> - ${discountAmount.toFixed(2)}</span>
                </div>
              )
            }
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

export default TotalPurchase