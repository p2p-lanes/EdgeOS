'use client'

import { SidebarProvider } from "@/components/Sidebar/SidebarComponents"
import ApplicationProvider from "@/providers/applicationProvider"
import CityProvider from "@/providers/cityProvider"
import { PoapsProvider } from "@/providers/poapsProvider"
import PassesDataProvider from "@/providers/productsProvider"
import PassesProvider from "@/providers/passesProvider"

const Providers = ({children}: {children: React.ReactNode}) => {
  return (
    <CityProvider>
      <ApplicationProvider>
        <PassesDataProvider>
          <PassesProvider>
            <PoapsProvider>
              <SidebarProvider>
                {children}
              </SidebarProvider>
            </PoapsProvider>
          </PassesProvider>
        </PassesDataProvider>
      </ApplicationProvider>
    </CityProvider>
  )
}
export default Providers