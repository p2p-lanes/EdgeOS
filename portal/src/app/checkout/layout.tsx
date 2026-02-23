"use client"

import ApplicationProvider from "@/providers/applicationProvider"
import CityProvider from "@/providers/cityProvider"
import DiscountProvider from "@/providers/discountProvider"
import PassesProvider from "@/providers/passesProvider"

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <CityProvider>
      <ApplicationProvider>
        <DiscountProvider>
          <PassesProvider>{children}</PassesProvider>
        </DiscountProvider>
      </ApplicationProvider>
    </CityProvider>
  )
}

export default layout
