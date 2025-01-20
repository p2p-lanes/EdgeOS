import { Ticket } from "lucide-react"
import { cn } from "@/lib/utils"
import { AttendeePassesProps } from "@/types/passes"
import Standard from "./Products/Standard"
import Month from "./Products/Month"

export const AttendeePassesSection = ({attendee, index, toggleProduct}: AttendeePassesProps) => {
  const monthProduct = attendee.products.find(p => p.attendee_category === attendee.category && p.category === 'month')
  const purchaseSomeProduct = attendee.products?.length ?? 0 > 0
  const weekProducts = attendee.products.filter(p => (p.category === 'week' || p.category === 'supporter') && p.attendee_category === attendee.category)

  const monthProductPurchased = attendee.products?.some(p => p.category === 'month')
  const hasExclusiveProduct = attendee.products?.some(p => p.exclusive && p.purchased) ?? false

  if (weekProducts.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="font-medium">
          {attendee.name} • <span className="text-sm text-muted-foreground">Attendee {index + 1}</span>
        </p>
        {(!purchaseSomeProduct && monthProduct?.id) && (
          <Month 
            product={monthProduct} 
            onClick={() => toggleProduct(attendee.id, monthProduct.id)}
          />
        )}
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 3xl:grid-cols-3 gap-2")}>
          {weekProducts?.map((product) => (
            <Standard
              key={product.id}
              iconTitle={Ticket}
              product={product}
              disabled={product.purchased || !!monthProductPurchased || hasExclusiveProduct}
              selected={product.selected}
              purchased={product.purchased}
              onClick={() => toggleProduct(attendee.id, product.id)}
              isSpecial={product.category === 'supporter'}
            />
          ))}
        </div>
      </div>
    </div>
  )
}