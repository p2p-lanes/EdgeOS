'use client'

import { SidebarProvider } from "@/components/ui/sidebar"
import CityProvider from "@/providers/cityProvider"

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