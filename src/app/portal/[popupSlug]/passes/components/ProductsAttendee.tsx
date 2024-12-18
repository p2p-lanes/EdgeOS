"use client"

import { Card } from "@/components/ui/card"
import { Button, ButtonAnimated } from "@/components/ui/button"
import { ProductsPass, ProductsProps } from "@/types/Products"
import { useMemo, useState } from "react"
import { TicketsBadge } from "./TicketsBadge"
import { ChevronDown, Gem, Ticket } from "lucide-react"
import { AttendeeProps } from "@/types/Attendee"
import PatreonPass from "./PatreonPass"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import usePostData from "../hooks/usePostData"

interface ProductsAttendeeProps {
  products: ProductsPass[];
  attendees: AttendeeProps[];
  onToggleProduct: (attendeeId: number, productId: number) => void;
}

export function ProductsAttendee({ products, attendees, onToggleProduct }: ProductsAttendeeProps) {
  const { purchaseProducts, loadingProduct } = usePostData()
  const [isOpen, setIsOpen] = useState(false)

  const total = products.reduce((sum, product) => sum + (product.selected ? product.price : 0), 0)

  const weekProducts = useMemo(() => products.filter((p: ProductsPass) => p.category === 'week'), [products])

  const hasSelectedWeeks = products.some(p => p.selected)

  const handleClickPurchase = async () => {
    await purchaseProducts(products)
  }

  const patreonSelected = products.find(p => (p.category === 'patreon')) ?? { id: 0, selected: false}
  const mainAttendee = attendees.find(a => a.category === 'main') ?? { id: 0 }

  return (
    <Card className="p-6 space-y-6">
      <h3 className="font-semibold">Select the weeks you&apos;ll attend!</h3>
      <div className="p-0 w-full">
        <PatreonPass
          icon={Gem}
          product={patreonSelected}
          selected={patreonSelected.selected ?? false}
          onClick={() => onToggleProduct(mainAttendee.id, patreonSelected.id)}
        />
      </div>
      {attendees.map((attendee, index) => (
        <div key={attendee.id} className="space-y-4">
          <div className="space-y-2">
            <p className="font-medium">{attendee.name} • <span className="text-sm text-muted-foreground">Attendee {index + 1}</span></p>
            <div className="flex flex-wrap gap-2">
              {weekProducts?.map((product: ProductsPass) => {
                if(product.attendee_category === attendee.category){
                  const disabledProduct = attendee.products?.some(p => p.id === product.id) ?? false
                  return(
                    <TicketsBadge 
                      key={product.id } 
                      iconTitle={Ticket} 
                      title={product.name} 
                      price={product.price} 
                      disabled={disabledProduct}
                      subtitle={'25-05 to 30-05'}
                      selected={product.selected && product.attendee_id === attendee.id}
                      onClick={() => onToggleProduct(attendee.id, product.id)}
                    />
                  )
                }
              })}
            </div>
          </div>
        </div>
      ))}

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
            <span className="font-medium">${total.toFixed(2)}</span>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {hasSelectedWeeks ? (
            <div className="space-y-2 px-3">
              {
                products.filter(p => p.selected).map(product => (
                  <div key={`${product.id}-${product.name}`} className="flex justify-between text-sm text-muted-foreground">
                    <span>1 x {product.name} ({product.attendee_category === 'main' ? 'Group lead' : product.attendee_category})</span>
                    <span>${product.price.toFixed(2)}</span>
                  </div>
                ))
              }
            </div>
          ) : (
            <p className="text-sm text-muted-foreground px-3">
              No weeks selected
            </p>
          )}
        </CollapsibleContent>
      </Collapsible>

      <ButtonAnimated disabled={!hasSelectedWeeks} loading={loadingProduct} className="w-full text-white" onClick={handleClickPurchase}>
        Complete Purchase
      </ButtonAnimated>
    </Card>
  )
}

