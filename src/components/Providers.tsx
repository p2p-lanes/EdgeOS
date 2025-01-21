'use client'

import { SidebarProvider } from "@/components/Sidebar/SidebarComponents"
import ApplicationProvider from "@/providers/applicationProvider"
import CityProvider from "@/providers/cityProvider"
import PassesProvider from "@/providers/passesProvider"

const Providers = ({children}: {children: React.ReactNode}) => {
  return (
    <CityProvider>
      <ApplicationProvider>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </ApplicationProvider>
    </CityProvider>
  )
}
export default Providers