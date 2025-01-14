import { Ticket } from "lucide-react"
import { cn } from "@/lib/utils"
import { AttendeePassesProps } from "@/types/passes"
import Standard from "./Products/Standard"
import Month from "./Products/Month"

export const AttendeePassesSection = ({attendee, index, products, onToggleProduct}: AttendeePassesProps) => {
  const monthProduct = products.find(p => p.attendee_category === attendee.category && p.category === 'month')
  const purchaseSomeProduct = attendee.products?.length ?? 0 > 0
  const weekProducts = products.filter(p => (p.category === 'week' || p.category === 'supporter') && p.attendee_category === attendee.category)

  const monthProductPurchased = attendee.products?.some(p => p.category === 'month')
  const hasExclusiveProduct = attendee.products?.some(p => p.exclusive) ?? false

  if (weekProducts.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="font-medium">
          {attendee.name} • <span className="text-sm text-muted-foreground">Attendee {index + 1}</span>
        </p>
        {!purchaseSomeProduct && (
          <Month 
            product={monthProduct} 
            onClick={() => onToggleProduct(attendee, monthProduct)}
          />
        )}
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 3xl:grid-cols-3 gap-2")}>
          {weekProducts?.map((product) => (
            <Standard
              key={product.id}
              iconTitle={Ticket}
              product={product}
              disabled={
                attendee.products?.some(p => p.id === product.id) ||
                !!monthProductPurchased ||
                (hasExclusiveProduct && product.exclusive)
              }
              selected={product.selected}
              purchased={attendee.products?.some(p => p.id === product.id)}
              onClick={() => onToggleProduct(attendee, product)}
              isSpecial={product.category === 'supporter'}
            />
          ))}
        </div>
      </div>
    </div>
  )
}