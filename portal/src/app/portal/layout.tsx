"use client"

import { usePathname } from "next/navigation"
import type * as React from "react"
import Authentication from "@/components/Authentication"
import HeaderBar from "@/components/Sidebar/HeaderBar"
import { BackofficeSidebar } from "@/components/Sidebar/Sidebar"
import { SidebarInset } from "@/components/Sidebar/SidebarComponents"
import Providers from "../../components/Providers"

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isProfilePage = pathname === "/portal/profile"

  return (
    <Authentication>
      <Providers>
        <BackofficeSidebar collapsible="icon" />
        <SidebarInset className="max-h-svh overflow-hidden">
          {!isProfilePage && <HeaderBar />}
          <main className="flex-1 overflow-y-auto bg-neutral-100">
            {children}
          </main>
        </SidebarInset>
      </Providers>
    </Authentication>
  )
}
