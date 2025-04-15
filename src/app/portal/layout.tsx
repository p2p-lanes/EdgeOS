"use client"

import * as React from "react"
import { SidebarInset } from "@/components/Sidebar/SidebarComponents"
import Authentication from "@/components/Authentication"
import useGetPopups from "@/hooks/useGetPopups"
import useGetApplications from "@/hooks/useGetApplications"
import { BackofficeSidebar } from "@/components/Sidebar/Sidebar"
import HeaderBar from "@/components/Sidebar/HeaderBar"
import Providers from "../../components/Providers"
import { useGetPoaps } from "@/hooks/useGetPoaps"

export default function PortalLayout({ children }: { children: React.ReactNode }) {

  return (
    <Providers>
      <Authentication>
        <RootGets/>
        <div className="flex min-h-screen w-[100%]">
          <BackofficeSidebar collapsible="icon" />
          <SidebarInset>
            <HeaderBar/>
            <main className="flex-1 w-[100%] bg-neutral-100">
              {children}
            </main>
          </SidebarInset>
        </div>
      </Authentication>
    </Providers>
  )
}

const RootGets = () => {
  useGetApplications()
  useGetPopups()
  useGetPoaps()
  return null
}

