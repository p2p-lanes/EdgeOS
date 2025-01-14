"use client"

import { Card } from "@/components/ui/card"
import { ButtonAnimated } from "@/components/ui/button"
import { ProductsPass } from "@/types/Products"
import { useMemo } from "react"
import { TicketsBadge } from "./TicketsBadge"
import { Ticket } from "lucide-react"
import { AttendeeProps } from "@/types/Attendee"
import { useCityProvider } from "@/providers/cityProvider"
import BannerDiscount from "./BannerDiscount"
import SelectFullMonth from "./SelectFullMonth"
import { Separator } from "@/components/ui/separator"
import TotalPurchase from "./TotalPurchase"
import { calculateTotal } from "../helpers/products"
import { cn } from "@/lib/utils"
import SpecialProductPass from "./SpecialProductPass"

interface ProductsAttendeeProps {
  products: ProductsPass[];
  attendees: AttendeeProps[];
  onToggleProduct: (attendee: AttendeeProps | undefined, product?: ProductsPass) => void;
  purchaseProducts: () => Promise<void>;
  loadingProduct: boolean;
}

export function ProductsAttendee({ products, attendees, onToggleProduct, purchaseProducts, loadingProduct }: ProductsAttendeeProps) {
  const { getRelevantApplication, getCity } = useCityProvider()
  const application = getRelevantApplication()
  const city = getCity()
  const total = useMemo(() => calculateTotal(attendees, products), [products, attendees]);
  
  const specialProduct = products.find(p => p.category === 'patreon')

  const hasSelectedWeeks = products.some(p => p.selected)
  const mainAttendee = attendees.find(a => a.category === 'main')
  
  const disabledPurchase = !hasSelectedWeeks || (specialProduct?.selected && mainAttendee?.products?.length === 0 && products.filter(p => p.category !== 'patreon' && p.selected).length === 0)
  const specialPurchase = mainAttendee?.products?.some(p => p.category === 'patreon')

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="font-semibold">Buy your passes!</h3>
        {
          city?.passes_description && (
            <p className="text-sm text-muted-foreground">
              {city?.passes_description}
            </p>
          )
        }
      </div>
      {attendees.map((attendee, index) => (
        <ProductsWeekAttendee 
          key={attendee.id} 
          attendee={attendee} 
          index={index} 
          products={products} 
          onToggleProduct={onToggleProduct}
        />
      ))}

      <Separator className="my-12"/>

      {
        specialProduct && (
          <div className="p-0 w-full">
            <SpecialProductPass
              product={specialProduct}
              selected={specialProduct?.selected ?? false}
              disabled={specialPurchase ?? false}
              onClick={() => onToggleProduct(mainAttendee, specialProduct)} 
            />
            <p className="text-xs text-muted-foreground mt-1">
              {specialProduct?.selected && specialProduct?.category === 'patreon' ? 'Patron ticket holders get free weekly passes for their whole family group' : ''}
            </p>
          </div>
        )
      }
      
      <BannerDiscount isPatreon={(specialProduct?.selected && specialProduct?.category === 'patreon') ?? false} application={application} products={products} />

      <TotalPurchase total={total} products={products} hasSelectedWeeks={hasSelectedWeeks}/>

      <ButtonAnimated disabled={disabledPurchase || loadingProduct} loading={loadingProduct} className="w-full text-white" onClick={purchaseProducts}>
        Complete Purchase
      </ButtonAnimated>
    </Card>
  )
}

const ProductsWeekAttendee = ({attendee, index, products, onToggleProduct}: {attendee: AttendeeProps, index: number, products: ProductsPass[], onToggleProduct: (attendee: AttendeeProps | undefined, product?: ProductsPass) => void}) => {
  const monthProduct = products.find(p => p.attendee_category === attendee.category && p.category === 'month')
  const purchaseSomeProduct = attendee.products?.length ?? 0 > 0
  const weekProducts = products.filter(p => (p.category === 'week' || p.category === 'supporter') && p.attendee_category === attendee.category)

  const monthProductPurchased = attendee.products?.some(p => p.category === 'month')
  const hasExclusiveProduct = attendee.products?.some(p => p.exclusive) ?? false

  if(weekProducts.length === 0) return null

  return (
    <div key={attendee.id} className="space-y-4">
      <div className="space-y-2">
      <p className="font-medium">{attendee.name} • <span className="text-sm text-muted-foreground">Attendee {index + 1}</span></p>
      {
        !purchaseSomeProduct && (
          <SelectFullMonth product={monthProduct} onClick={() => onToggleProduct(attendee, monthProduct)}/>
        )
      }
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 3xl:grid-cols-3 gap-2")}>
        {weekProducts?.map((product: ProductsPass) => {
            const disabledProduct = attendee.products?.some(p => p.id === product.id) ?? false
            const isDisabled = disabledProduct || !!monthProductPurchased || (hasExclusiveProduct && product.exclusive)
            return(
              <TicketsBadge
                key={product.id} 
                iconTitle={Ticket} 
                product={product}
                disabled={isDisabled}
                selected={product.selected}
                purchased={attendee.products?.some(p => p.id === product.id)}
                onClick={() => onToggleProduct(attendee, product)}
                isSpecial={product.category === 'supporter'}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
