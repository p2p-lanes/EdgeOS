"use client"

import { Card } from "@/components/ui/card"
import { ButtonAnimated } from "@/components/ui/button"
import { ProductsPass } from "@/types/Products"
import { useMemo } from "react"
import { TicketsBadge } from "./TicketsBadge"
import { Ticket } from "lucide-react"
import { AttendeeProps } from "@/types/Attendee"
import PatreonPass from "./PatreonPass"
import { useCityProvider } from "@/providers/cityProvider"
import BannerDiscount from "./BannerDiscount"
import SelectFullMonth from "./SelectFullMonth"
import { Separator } from "@/components/ui/separator"
import TotalPurchase from "./TotalPurchase"
import { calculateTotal } from "../helpers/products"

interface ProductsAttendeeProps {
  products: ProductsPass[];
  attendees: AttendeeProps[];
  onToggleProduct: (attendee: AttendeeProps | undefined, product?: ProductsPass) => void;
  purchaseProducts: () => Promise<void>;
  loadingProduct: boolean;
}

export function ProductsAttendee({ products, attendees, onToggleProduct, purchaseProducts, loadingProduct }: ProductsAttendeeProps) {
  const { getRelevantApplication } = useCityProvider()
  const application = getRelevantApplication()
  
  const patreonSelected = products.find(p => p.category === 'patreon')
  
  const total = useMemo(() => calculateTotal(attendees, products), [products, attendees]);

  const hasSelectedWeeks = products.some(p => p.selected)
  const mainAttendee = attendees.find(a => a.category === 'main')
  
  const disabledPurchase = !hasSelectedWeeks || (patreonSelected?.selected && mainAttendee?.products?.length === 0 && products.filter(p => p.category !== 'patreon' && p.selected).length === 0)
  const patreonPurchase = mainAttendee?.products?.some(p => p.category === 'patreon')

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="font-semibold">Select the weeks you&apos;ll attend!</h3>
        <p className="text-sm text-muted-foreground">Not sure which week to pick? You can buy now and switch your week closer to the event.
          Lock in your spot today!
        </p>
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

      <div className="p-0 w-full">
        <PatreonPass
          product={patreonSelected}
          selected={patreonSelected?.selected ?? false}
          disabled={patreonPurchase ?? false}
          onClick={() => onToggleProduct(mainAttendee, patreonSelected)} 
        />
        <p className="text-xs text-muted-foreground mt-1">
          {patreonSelected?.selected ? 'Patron ticket holders get free weekly passes for their whole family group' : ''}
        </p>
      </div>
      
      <BannerDiscount isPatreon={patreonSelected?.selected ?? false} application={application} />

      <TotalPurchase total={total} products={products} hasSelectedWeeks={hasSelectedWeeks}/>

      <ButtonAnimated disabled={disabledPurchase} loading={loadingProduct} className="w-full text-white" onClick={purchaseProducts}>
        Complete Purchase
      </ButtonAnimated>
    </Card>
  )
}

const ProductsWeekAttendee = ({attendee, index, products, onToggleProduct}: {attendee: AttendeeProps, index: number, products: ProductsPass[], onToggleProduct: (attendee: AttendeeProps | undefined, product?: ProductsPass) => void}) => {
  const monthProduct = products.find(p => p.attendee_category === attendee.category && p.category === 'month')
  const purchaseSomeProduct = attendee.products?.length ?? 0 > 0
  const weekProducts = products.filter(p => p.category === 'week')

  const monthProductPurchased = attendee.products?.some(p => p.category === 'month')

  return (
    <div key={attendee.id} className="space-y-4">
      <div className="space-y-2">
      <p className="font-medium">{attendee.name} • <span className="text-sm text-muted-foreground">Attendee {index + 1}</span></p>
      {
        !purchaseSomeProduct && (
          <SelectFullMonth product={monthProduct} onClick={() => onToggleProduct(attendee, monthProduct)}/>
        )
      }
      <div className="grid grid-cols-1 sm:grid-cols-2 3xl:grid-cols-3 gap-2">
        {weekProducts?.map((product: ProductsPass) => {
          if(product.attendee_category === attendee.category){
            const disabledProduct = attendee.products?.some(p => p.id === product.id) ?? false
            return(
              <TicketsBadge
                key={product.id} 
                iconTitle={Ticket} 
                product={product}
                disabled={disabledProduct || !!monthProductPurchased}
                selected={product.selected}
                onClick={() => onToggleProduct(attendee, product)}
              />
            )
          }
        })}
      </div>
    </div>
  </div>
  )
}
