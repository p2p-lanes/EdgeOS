import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { ProductsPass } from "@/types/Products"
import { ChevronDown } from "lucide-react"
import { useState } from "react"

const TotalPurchase = ({total, products, hasSelectedWeeks}: {
  total: { originalTotal: number, total: number }, 
  products: ProductsPass[],
  hasSelectedWeeks: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const productsCart = products.filter(p => p.selected && p.category !== 'month')

  return (
    <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="space-y-4 pt-4"
      >
        <CollapsibleTrigger className="w-full">
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
            <div className="flex items-center gap-2">
              <ChevronDown 
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isOpen && "transform rotate-180"
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
              <span className="font-medium">${total.total.toFixed(2)}</span>
            </div>

          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {hasSelectedWeeks ? (
            <div className="space-y-2 px-3">
              {
                productsCart.map(product => (
                  <div key={`${product.id}-${product.name}`} className="flex justify-between text-sm text-muted-foreground">
                    <span>1 x {product.name} ({product.attendee_category === 'main' ? 'Primary Ticket Holder' : product.attendee_category})</span>
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