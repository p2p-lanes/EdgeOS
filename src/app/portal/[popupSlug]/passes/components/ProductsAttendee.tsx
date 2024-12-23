"use client"

import { Card } from "@/components/ui/card"
import { ButtonAnimated } from "@/components/ui/button"
import { ProductsPass } from "@/types/Products"
import { useMemo, useState } from "react"
import { TicketsBadge } from "./TicketsBadge"
import { ChevronDown, Gem, Ticket } from "lucide-react"
import { AttendeeProps } from "@/types/Attendee"
import PatreonPass from "./PatreonPass"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import usePostData from "../hooks/usePostData"
import { useCityProvider } from "@/providers/cityProvider"
import BannerDiscount from "./BannerDiscount"
import SelectFullMonth from "./SelectFullMonth"

interface ProductsAttendeeProps {
  products: ProductsPass[];
  attendees: AttendeeProps[];
  onToggleProduct: (attendeeId: number, product?: ProductsPass) => void;
}

export function ProductsAttendee({ products, attendees, onToggleProduct }: ProductsAttendeeProps) {
  const { purchaseProducts, loadingProduct } = usePostData()
  const { getRelevantApplication } = useCityProvider()
  const application = getRelevantApplication()
  const [isOpen, setIsOpen] = useState(false)
  
  const weekProducts = useMemo(() => products.filter((p: ProductsPass) => p.category === 'week'), [products])
  const patreonSelected = products.find(p => p.category === 'patreon')
  const monthProducts = useMemo(() => products.filter((p: ProductsPass) => p.category === 'month'), [products])
  
  const total = useMemo(() => {
    const weekTotal = products.reduce((sum, product) => 
      sum + (product.selected ? product.compare_price ?? 0 : 0), 0
    )

    const calculateWeekPrice = () => {
      return products.reduce((sum, product) => {
        if (!product.selected) return sum;
        
        // Si es Builder, usa builder_price, sino usa price
        const productPrice = application?.ticket_category === 'Builder' 
          ? (product.builder_price ?? product.price)
          : application?.ticket_category === 'Scholarship' ? 0 : product.price;
          
        return sum + productPrice;
      }, 0);
    };
    
    if (patreonSelected?.selected) {
      return {
        weekTotal: weekTotal + patreonSelected.price,  // Total de las semanas para mostrar tachado
        finalTotal: patreonSelected.price  // Precio final del patreon
      }
    }
    
    const calculatedTotal = calculateWeekPrice();
    
    return {
      weekTotal,
      finalTotal: calculatedTotal
    }
  }, [weekProducts, patreonSelected, application?.ticket_category])

  const hasSelectedWeeks = products.some(p => p.selected)

  const handleClickPurchase = async () => {
    await purchaseProducts(products)
  }

  const mainAttendee = attendees.find(a => a.category === 'main') ?? { id: 0, products: [] }
  const patreonPurchase = mainAttendee?.products?.some(p => p.category === 'patreon')
  const labelDiscount = patreonSelected?.selected ? 'in passes for patron ticket holders' : application?.ticket_category === 'Builder' ? 'Builders Discount included' : 'Scholar Discount included'
  const hasDiscount = (application?.ticket_category === 'Builder' || application?.ticket_category === 'Scholarship') && !patreonPurchase
  const productCompare = products.find(p => p.category === 'week' && p.attendee_category === 'main') ?? { price: 0, builder_price: 0, compare_price: 0 }
  const discountPercentage = application.ticket_category === 'Scholarship' ? 100 : ((productCompare.compare_price ?? 0) - (productCompare.builder_price ?? 0)) / (productCompare.compare_price ?? 0 ) * 100;

  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-semibold">Select the weeks you&apos;ll attend!</h3>
      {attendees.map((attendee, index) => {
        const monthProduct = monthProducts.find(p => p.attendee_category === attendee.category)
        return (
          <div key={attendee.id} className="space-y-4">
            <div className="space-y-2">
            <p className="font-medium">{attendee.name} • <span className="text-sm text-muted-foreground">Attendee {index + 1}</span></p>
            <SelectFullMonth product={monthProduct} onClick={() => onToggleProduct(attendee.id, monthProduct)}/>
            <div className="grid grid-cols-1 sm:grid-cols-2 3xl:grid-cols-3 gap-2">
              {weekProducts?.map((product: ProductsPass) => {
                if(product.attendee_category === attendee.category){
                  const disabledProduct = (attendee.products?.some(p => p.id === product.id) || monthProducts.some(p => (p.attendee_category === attendee.category && p.selected))) ?? false
                  return(
                    <TicketsBadge
                      patreonSelected={patreonSelected?.selected ?? false}
                      category={application?.ticket_category ?? 'Standard'}
                      key={product.id} 
                      iconTitle={Ticket} 
                      product={product}
                      disabled={disabledProduct}
                      selected={product.selected && product.attendee_id === attendee.id}
                      onClick={() => onToggleProduct(attendee.id, product)}
                    />
                  )
                }
              })}
            </div>
          </div>
        </div>
        )
      })}

      <div className="p-0 w-full">
        <PatreonPass
          product={patreonSelected}
          selected={patreonSelected?.selected ?? false}
          disabled={patreonPurchase ?? false}
          onClick={() => onToggleProduct(mainAttendee.id, patreonSelected)} 
        />
        <p className="text-xs text-muted-foreground mt-1">
          {patreonSelected?.selected ? 'Patron ticket holders get free weekly passes for their whole family group' : ''}
        </p>
      </div>
      
      {
        hasDiscount && (
          <BannerDiscount discount={patreonSelected?.selected ? '100' : discountPercentage.toFixed(0)} label={labelDiscount} />
        )
      }

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
            <CalculateTotal total={total} discount={discountPercentage} patreonSelected={patreonSelected?.selected ?? false} ticketCategory={application?.ticket_category ?? ''}/>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {hasSelectedWeeks ? (
            <div className="space-y-2 px-3">
              {
                products.filter(p => p.selected).map(product => (
                  <div key={`${product.id}-${product.name}`} className="flex justify-between text-sm text-muted-foreground">
                    <span>1 x {product.name} ({product.attendee_category === 'main' ? 'Primary Ticket Holder' : product.attendee_category})</span>
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

const CalculateTotal = ({total, discount, patreonSelected, ticketCategory}: {
  total: { weekTotal: number, finalTotal: number }, 
  discount: number, 
  patreonSelected: boolean,
  ticketCategory: string
}) => {
  if (patreonSelected) {
    return (
      <div className="flex items-center gap-2">
        {total.weekTotal > 0 && total.weekTotal !== total.finalTotal && (
          <span className="text-xs text-muted-foreground line-through">
            ${total.weekTotal.toFixed(2)}
          </span>
        )}
        <span className="font-medium">${total.finalTotal.toFixed(2)}</span>
      </div>
    )
  }
  
  return (
    <div className="flex items-center gap-2">
      {total.weekTotal > 0 && total.weekTotal !== total.finalTotal && (
        <span className="text-xs text-muted-foreground line-through">
          ${total.weekTotal.toFixed(2)}
        </span>
      )}
      <span className="font-medium">${total.finalTotal.toFixed(2)}</span>
    </div>
  )
}

