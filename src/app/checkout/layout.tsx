"use client"

import ApplicationProvider from "@/providers/applicationProvider"
import CityProvider from "@/providers/cityProvider"
import PassesDataProvider from "@/providers/productsProvider"
import PassesProvider from "@/providers/passesProvider"
import TotalProvider from "@/providers/totalProvider"
import { GroupsProvider } from "@/providers/groupsProvider"

const layout = ({children}: {children: React.ReactNode}) => {

  return (
    <CityProvider>
      <ApplicationProvider>
            <GroupsProvider>
        <PassesDataProvider>
          <PassesProvider>
              <TotalProvider>
                {children}
              </TotalProvider>
          </PassesProvider>
        </PassesDataProvider>
            </GroupsProvider>
      </ApplicationProvider>
    </CityProvider>
  )
}

export default layout