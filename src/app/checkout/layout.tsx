"use client"

import ApplicationProvider from "@/providers/applicationProvider"
import CityProvider from "@/providers/cityProvider"
import PassesProvider from "@/providers/passesProvider"
import TotalProvider from "@/providers/totalProvider"

const layout = ({children}: {children: React.ReactNode}) => {

  return (
    <CityProvider>
      <ApplicationProvider>
        <PassesProvider>
          <TotalProvider>
            {children}
          </TotalProvider>
        </PassesProvider>
      </ApplicationProvider>
    </CityProvider>
  )
}

export default layout