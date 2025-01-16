"use client"

import { Card } from "@/components/ui/card"
import { ButtonAnimated } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCityProvider } from "@/providers/cityProvider"
import { PassesProps } from "@/types/passes"
import { AttendeePassesSection } from "./AttendeePassesSection"
import Special from "./Products/Special"
import BannerDiscount from "./Components/BannerDiscount"
import TotalPurchase from "./Components/TotalPurchase"
import { usePasses } from "../../../hooks/usePasses"

export default function PassesSidebar({
  attendees, 
  onToggleProduct, 
  purchaseProducts, 
  loading 
}: PassesProps) {
  const { getRelevantApplication, getCity } = useCityProvider()
  const application = getRelevantApplication()
  const city = getCity()
  
  const {
    total,
    specialProduct,
    hasSelectedWeeks,
    mainAttendee,
    disabledPurchase,
    specialPurchase
  } = usePasses(attendees)

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="font-semibold">Buy your passes!</h3>
        {city?.passes_description && (
          <p className="text-sm text-muted-foreground">
            {city?.passes_description}
          </p>
        )}
      </div>

      {attendees.map((attendee, index) => (
        <AttendeePassesSection
          key={attendee.id}
          attendee={attendee}
          index={index}
          products={attendee.products}
          onToggleProduct={onToggleProduct}
        />
      ))}

      <Separator className="my-12"/>

      {specialProduct && (
        <div className="p-0 w-full">
          <Special
            product={specialProduct}
            selected={specialProduct?.selected ?? false}
            disabled={specialPurchase ?? false}
            onClick={() => onToggleProduct(mainAttendee, specialProduct)}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {specialProduct?.selected && specialProduct?.category === 'patreon' 
              ? 'Patron ticket holders get free weekly passes for their whole family group' 
              : ''
            }
          </p>
        </div>
      )}
      
      {/* <BannerDiscount 
        isPatreon={(specialProduct?.selected && specialProduct?.category === 'patreon') ?? false} 
        application={application} 
        products={products} 
      />

      <TotalPurchase 
        total={total} 
        products={products} 
        hasSelectedWeeks={hasSelectedWeeks}
      /> */}

      <ButtonAnimated 
        disabled={disabledPurchase || loading} 
        loading={loading} 
        className="w-full text-white" 
        onClick={purchaseProducts}
      >
        Complete Purchase
      </ButtonAnimated>
    </Card>
  )
}
