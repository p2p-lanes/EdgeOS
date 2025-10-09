'use client'

import { SidebarProvider } from "@/components/Sidebar/SidebarComponents"
import ApplicationProvider from "@/providers/applicationProvider"
import CityProvider from "@/providers/cityProvider"
import { PoapsProvider } from "@/providers/poapsProvider"
import PassesDataProvider from "@/providers/productsProvider"
import PassesProvider from "@/providers/passesProvider"
import { GroupsProvider } from "@/providers/groupsProvider"

const Providers = ({children}: {children: React.ReactNode}) => {
  return (
    <CityProvider>
      <ApplicationProvider>
        <PassesDataProvider>
          <PassesProvider>
            <PoapsProvider>
              <GroupsProvider>
                <SidebarProvider>
                  {children}
                </SidebarProvider>
              </GroupsProvider>
            </PoapsProvider>
          </PassesProvider>
        </PassesDataProvider>
      </ApplicationProvider>
    </CityProvider>
  )
}
export default Providers