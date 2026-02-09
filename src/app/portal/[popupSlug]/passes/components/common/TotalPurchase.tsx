import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { ChevronRight, Tag, Heart } from "lucide-react"
import { AttendeeProps } from "@/types/Attendee"
import { DiscountProps } from "@/types/discounts"
import useDiscountCode from "../../hooks/useDiscountCode"
import ProductCart from "./Products/ProductCart"
import { useTotal } from "@/providers/totalProvider"
import { ProductsPass } from "@/types/Products"
import { useApplication } from "@/providers/applicationProvider"

const TotalPurchase = ({ attendees, isModal, isOpen, setIsOpen }: {attendees: AttendeeProps[], isModal?: boolean, isOpen: boolean, setIsOpen: (prev: boolean) => void}) => {
  const { discountApplied } = useDiscountCode()
  const { originalTotal, total, discountAmount, variableAmount, groupDiscountPercentage, groupName } = useTotal()
  const { getRelevantApplication } = useApplication()
  const application = getRelevantApplication()

  // Detectar si hay productos month seleccionados
  const hasMonthSelected = attendees.some(attendee => 
    attendee.products.some(p => p.selected && (p.category === 'month' || p.category === 'local month'))
  )

  const productsCart = attendees.flatMap(attendee => {
    const selectedProducts = attendee.products.filter(p => p.selected)
    
    // Si hay un month seleccionado, solo mostrar los productos month
    if (hasMonthSelected) {
      return selectedProducts.filter(p => p.category === 'month' || p.category === 'local month')
    }
    
    // Lógica original si no hay month seleccionado
    return selectedProducts
  }).sort((a, b) => {
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

            {/* <DiscountMonth attendees={attendees} total={total}/> */}

            <DiscountWeekPurchased attendees={attendees} hasMonthSelected={hasMonthSelected}/>

            {
              groupDiscountPercentage >= discountApplied.discount_value ? (
                <GroupDiscountDisplay groupDiscountPercentage={groupDiscountPercentage} groupName={groupName} />
              ) : (
                <DiscountCouponTotal products={productsCart} discountAmount={discountAmount} discountApplied={discountApplied} patreonSelected={patreonSelected} />
              )
            }

            <VariableAmountDisplay variableAmount={variableAmount} />

            {
              application?.credit ? (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span className="text-sm text-muted-foreground">
                    Credit
                  </span>
                </div>
                  <span> - ${application?.credit.toFixed(0)}</span>
                </div>
              ) : null
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

const DiscountCouponTotal = ({ discountAmount, discountApplied, patreonSelected, products }: {
  discountAmount: number,
  discountApplied: DiscountProps,
  patreonSelected: boolean,
  products: ProductsPass[]
}) => {

  if(!discountApplied.discount_value || discountAmount === 0) return null

  const getLabelDiscount = () => {
    if(patreonSelected){
      return 'Patron Free Tickets'
    }
    if(discountApplied.discount_code){
      return `${discountApplied.discount_code } (${discountApplied.discount_value}% OFF)`
    }
    return `Discount ${discountApplied.discount_value}% OFF`
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
        <span data-discount-amount={discountAmount.toFixed(0)}> - ${discountAmount.toFixed(0)}</span>
      </div>
    )
  }

  return null
}

const DiscountMonth = ({ attendees, total }: { attendees: AttendeeProps[], total: number }) => {

  const calculateDiscountMonth = () => {
    const totalPrice = attendees.reduce((total, attendee) => {
      return total + attendee.products
        .filter(p => p.selected && (p.category === 'week' || p.category === 'local week'))
        .reduce((sum, product) => sum + (product.price ?? 0), 0)
    }, 0)

    return totalPrice - total
  }
  // const hasPatreon = attendees.some(attendee => attendee.products.some(p => p.category === 'patreon' && (p.selected || p.purchased)))
  const hasMonthSelected = attendees.some(attendee => attendee.products.some(p => p.selected && (p.category === 'month' || p.category === 'local month')))

  if(!hasMonthSelected) return null

  const discountMonth = calculateDiscountMonth()

  if(discountMonth <= 0) return null

  return (
     <div className="flex justify-between text-sm text-muted-foreground">
        <span className="flex items-center gap-2"><Tag className="w-4 h-4" />Discount on Full Month</span>
        <span data-month-discount={discountMonth}> - ${discountMonth.toFixed(0)}</span>
      </div>
  )
}

const DiscountWeekPurchased = ({ attendees, hasMonthSelected }: { 
  attendees: AttendeeProps[], 
  hasMonthSelected: boolean 
}) => {
  
  if (!hasMonthSelected) return null

  const calculateWeekPurchasedDiscount = () => {
    return attendees.reduce((totalDiscount, attendee) => {
      // Verificar si este attendee tiene un month seleccionado
      const hasMonthSelectedForAttendee = attendee.products.some(p => p.selected && (p.category === 'month' || p.category === 'local month'))
      
      if (!hasMonthSelectedForAttendee) return totalDiscount

      // Buscar productos week comprados para este attendee
      const weekPurchasedProducts = attendee.products.filter(p => 
        p.purchased && (p.category === 'week' || p.category === 'local week')
      )

      // Sumar el original_price de los productos week comprados
      const weekDiscount = weekPurchasedProducts.reduce((sum, product) => {
        const price = product.price || 0
        return sum + price
      }, 0)

      return totalDiscount + weekDiscount
    }, 0)
  }

  const weekDiscount = calculateWeekPurchasedDiscount()

  if (weekDiscount <= 0) return null

  return (
    <div className="flex justify-between text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <Tag className="w-4 h-4" />
        <span className="text-sm text-muted-foreground">
          Week Pass Credit
        </span>
      </div>
      <span data-week-discount={weekDiscount.toFixed(0)}> - ${weekDiscount.toFixed(0)}</span>
    </div>
  )
}

const GroupDiscountDisplay = ({ groupDiscountPercentage, groupName }: { 
  groupDiscountPercentage: number, 
  groupName: string | null 
}) => {
  if (!groupDiscountPercentage || groupDiscountPercentage === 0) return null

  return (
    <div className="flex justify-between text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <Tag className="w-4 h-4" />
        <span className="text-sm text-muted-foreground">
          {groupName ? `${groupName} Group (${groupDiscountPercentage}% OFF)` : `Group Discount (${groupDiscountPercentage}% OFF)`}
        </span>
      </div>
      <span className="text-green-600 font-medium">Applied</span>
    </div>
  )
}

const VariableAmountDisplay = ({ variableAmount }: { variableAmount: number }) => {
  if (!variableAmount || variableAmount === 0) return null

  return (
    <div className="flex justify-between text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <Heart className="w-4 h-4 text-orange-500" />
        <span className="text-sm text-muted-foreground">
          Contribution (no discounts)
        </span>
      </div>
      <span data-variable-amount={variableAmount.toFixed(0)}>${variableAmount.toFixed(0)}</span>
    </div>
  )
}

export default TotalPurchase