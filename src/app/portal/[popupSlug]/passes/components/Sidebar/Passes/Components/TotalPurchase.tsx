import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { ProductsPass } from "@/types/Products"
import { ChevronRight } from "lucide-react"
import { useState } from "react"
import { badgeName } from "../../../../constants/multiuse"
import { AttendeeProps } from "@/types/Attendee"

const TotalPurchase = ({total, attendees }: {
  total: { originalTotal: number, total: number }, 
  attendees: AttendeeProps[]
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const productsCart = attendees.flatMap(attendee => attendee.products.filter(p => p.selected && p.category !== 'month'))

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="space-y-4 pt-4"
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
            {total.originalTotal > 0 && total.originalTotal !== total.total && (
              <span className="text-xs text-muted-foreground line-through">
                ${total.originalTotal.toFixed(2)}
              </span>
            )}
            <span data-testid="total-price" className="font-medium">${total.total.toFixed(2)}</span>
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