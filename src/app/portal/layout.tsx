"use client"

import * as React from "react"
import { ChevronRight } from 'lucide-react'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SidebarTrigger, SidebarInset } from "@/components/Sidebar/SidebarComponents"
import { useCityProvider } from "@/providers/cityProvider"
import Authentication from "@/app/Authentication"
import useGetPopups from "@/hooks/useGetPopups"
import useGetApplications from "@/hooks/useGetApplications"
import { BackofficeSidebar } from "@/components/Sidebar/Sidebar"

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { getCity } = useCityProvider()
  const city = getCity()

  useGetApplications()
  useGetPopups()

  return (
    <Authentication>
      <div className="flex min-h-screen">
        <BackofficeSidebar collapsible="icon" />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-6 w-[100%]">
            <SidebarTrigger />
            <Breadcrumb>
              <BreadcrumbList>
              <BreadcrumbItem>
                  <BreadcrumbPage>{city?.name}</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/portal">Application</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <main className="flex-1 p-6 w-[100%]">
            {children}
          </main>
        </SidebarInset>
      </div>
    </Authentication>
  )
}

