"use client"

import { Card } from "@/components/ui/card"
import { ButtonAnimated } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCityProvider } from "@/providers/cityProvider"
import { AttendeePassesSection } from "./AttendeePassesSection"
import Special from "./Products/Special"
import BannerDiscount from "./Components/BannerDiscount"
import TotalPurchase from "./Components/TotalPurchase"
import { usePasses } from "../../../hooks/usePasses"
import { usePassesProvider } from "@/providers/passesProvider"
import usePurchaseProducts from "../../../hooks/usePurchaseProducts"
import { useApplication } from "@/providers/applicationProvider"
import { Skeleton } from "@/components/ui/skeleton"
import DiscountCode from "./Components/DiscountCode"

export default function PassesSidebar() {
  const { getCity } = useCityProvider()
  const { getRelevantApplication } = useApplication()
  const application = getRelevantApplication()
  const city = getCity()
  const { toggleProduct, attendeePasses, products } = usePassesProvider()
  const { purchaseProducts, loading } = usePurchaseProducts()

  const {
    specialProduct,
    mainAttendee,
    disabledPurchase,
    specialPurchase
  } = usePasses(attendeePasses)
  
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

      <BannerDiscount 
        isPatreon={((specialProduct?.selected || specialProduct?.purchased) && specialProduct?.category === 'patreon') ?? false} 
        application={application}
        products={products}
      />

      {!attendeePasses || attendeePasses.length === 0 && (
        <div className="space-y-4">
          <Skeleton className="h-[21px] w-[160px] rounded-lg" />
          <Skeleton className="h-[92px] rounded-lg" />
          <Skeleton className="h-[21px] w-[160px]  rounded-lg" />
          <Skeleton className="h-[92px] rounded-lg" />
        </div>
      )}

      {attendeePasses.map((attendee, index) => (
        <AttendeePassesSection
          key={attendee.id}
          attendee={attendee}
          index={index}
          toggleProduct={toggleProduct}
        />
      ))}

      <Separator className="my-12"/>

      {(specialProduct && mainAttendee?.id) && (
        <div className="p-0 w-full">
          <Special
            product={specialProduct}
            selected={specialProduct?.selected ?? false}
            disabled={specialPurchase ?? false}
            onClick={() => toggleProduct(mainAttendee.id, specialProduct)}
          />
        </div>
      )}

      {/* <DiscountCode/> */}

      <TotalPurchase
        attendees={attendeePasses}
      />

      <ButtonAnimated 
        disabled={disabledPurchase || loading} 
        loading={loading} 
        className="w-full text-white" 
        onClick={() => purchaseProducts(attendeePasses)}
        data-purchase
      >
        Complete Purchase
      </ButtonAnimated>
    </Card>
  )
}
