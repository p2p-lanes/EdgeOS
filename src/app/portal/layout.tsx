"use client"

import * as React from "react"
import { SidebarInset } from "@/components/Sidebar/SidebarComponents"
import Authentication from "@/app/Authentication"
import useGetPopups from "@/hooks/useGetPopups"
import useGetApplications from "@/hooks/useGetApplications"
import { BackofficeSidebar } from "@/components/Sidebar/Sidebar"
import HeaderBar from "@/components/Sidebar/HeaderBar"

export default function PortalLayout({ children }: { children: React.ReactNode }) {

  useGetApplications()
  useGetPopups()

  return (
    <Authentication>
      <div className="flex min-h-screen">
        <BackofficeSidebar collapsible="icon" />
        <SidebarInset>
          <HeaderBar/>
          <main className="flex-1 p-6 w-[100%]">
            {children}
          </main>
        </SidebarInset>
      </div>
    </Authentication>
  )
}

