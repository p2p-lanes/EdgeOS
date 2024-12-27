"use client"

import { Card } from "@/components/ui/card"
import { ButtonAnimated } from "@/components/ui/button"
import { ProductsPass } from "@/types/Products"
import { useMemo } from "react"
import { TicketsBadge } from "./TicketsBadge"
import { Ticket } from "lucide-react"
import { AttendeeProps } from "@/types/Attendee"
import PatreonPass from "./PatreonPass"
import usePostData from "../hooks/usePostData"
import { useCityProvider } from "@/providers/cityProvider"
import BannerDiscount from "./BannerDiscount"
import SelectFullMonth from "./SelectFullMonth"
import { Separator } from "@/components/ui/separator"
import TotalPurchase from "./TotalPurchase"

interface ProductsAttendeeProps {
  products: ProductsPass[];
  attendees: AttendeeProps[];
  onToggleProduct: (attendee: AttendeeProps | undefined, product?: ProductsPass) => void;
}

export function ProductsAttendee({ products, attendees, onToggleProduct }: ProductsAttendeeProps) {
  const { purchaseProducts, loadingProduct } = usePostData()
  const { getRelevantApplication } = useCityProvider()
  const application = getRelevantApplication()
  
  const patreonSelected = products.find(p => p.category === 'patreon')
  
  const total = useMemo(() => {
    const calculateAttendeeTotal = (attendeeProducts: ProductsPass[]) => {
      const monthProduct = attendeeProducts.find(p => p.category === 'month' && p.selected);
      
      if (monthProduct) {
        return {
          total: monthProduct.price ?? 0,
          originalTotal: monthProduct.original_price ?? 0
        };
      }

      const selectedProducts = attendeeProducts.filter(p => p.selected);
      return {
        total: patreonSelected?.selected 
          ? 0  // Si hay patreon seleccionado, el total de los productos es 0
          : selectedProducts.reduce((sum, product) => sum + (product.price ?? 0), 0),
        originalTotal: selectedProducts.reduce((sum, product) => sum + (product.original_price ?? 0), 0)
      };
    };

    const totals = attendees.reduce((acc, attendee) => {
      const attendeeProducts = products.filter(p => p.attendee_id === attendee.id);
      const attendeeTotals = calculateAttendeeTotal(attendeeProducts);
      return {
        total: acc.total + attendeeTotals.total,
        originalTotal: acc.originalTotal + attendeeTotals.originalTotal
      };
    }, { total: 0, originalTotal: 0 });

    if (patreonSelected?.selected) {
      return {
        total: patreonSelected.price ?? 0,
        originalTotal: totals.originalTotal + (patreonSelected.price ?? 0)
      };
    }

    return totals;
  }, [products, attendees, patreonSelected]);

  const hasSelectedWeeks = products.some(p => p.selected)

  const handleClickPurchase = async () => {
    await purchaseProducts(products)
  }

  const mainAttendee = attendees.find(a => a.category === 'main')
  const patreonPurchase = mainAttendee?.products?.some(p => p.category === 'patreon')
  const labelDiscount = patreonSelected?.selected ? 'in passes for patron ticket holders' : application?.ticket_category === 'Builder' ? 'Builders Discount included' : 'Scholar Discount included'
  const hasDiscount = (application?.ticket_category === 'Builder' || application?.ticket_category === 'Scholarship') && !patreonPurchase
  const productCompare = products.find(p => p.category === 'week' && p.attendee_category === 'main') ?? { price: 0, builder_price: 0, compare_price: 0 }
  const discountPercentage = application.ticket_category === 'Scholarship' ? 100 : ((productCompare.compare_price ?? 0) - (productCompare.builder_price ?? 0)) / (productCompare.compare_price ?? 0 ) * 100;

  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-semibold">Select the weeks you&apos;ll attend!</h3>
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
      
      {
        hasDiscount && (
          <BannerDiscount discount={patreonSelected?.selected ? '100' : discountPercentage.toFixed(0)} label={labelDiscount} />
        )
      }

      <TotalPurchase total={total} products={products} hasSelectedWeeks={hasSelectedWeeks}/>

      <ButtonAnimated disabled={!hasSelectedWeeks} loading={loadingProduct} className="w-full text-white" onClick={handleClickPurchase}>
        Complete Purchase
      </ButtonAnimated>
    </Card>
  )
}

const ProductsWeekAttendee = ({attendee, index, products, onToggleProduct}: {attendee: AttendeeProps, index: number, products: ProductsPass[], onToggleProduct: (attendee: AttendeeProps | undefined, product?: ProductsPass) => void}) => {
  const monthProduct = products.find(p => p.attendee_category === attendee.category && p.category === 'month')
  const purchaseSomeProduct = attendee.products?.length ?? 0 > 0
  const weekProducts = products.filter(p => p.category === 'week')

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
            const isPreSelected = monthProduct?.selected && !disabledProduct
            return(
              <TicketsBadge
                key={product.id} 
                iconTitle={Ticket} 
                product={product}
                disabled={disabledProduct}
                selected={(product.selected && product.attendee_id === attendee.id) || isPreSelected}
                onClick={!isPreSelected ? () => onToggleProduct(attendee, product) : undefined}
              />
            )
          }
        })}
      </div>
    </div>
  </div>
  )
}
