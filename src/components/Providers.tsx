'use client'

import { SidebarProvider } from "@/components/Sidebar/SidebarComponents"
import CityProvider from "@/providers/cityProvider"
import PassesProvider from "@/providers/passesProvider"

const Providers = ({children}: {children: React.ReactNode}) => {
  return (
    <CityProvider>
      <SidebarProvider>
          {children}
      </SidebarProvider>
    </CityProvider>
  )
}
export default Providers