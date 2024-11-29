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
import { SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { BackofficeSidebar } from "@/components/backoffice-sidebar"
import Authentication from "../Authentication"
import { useCityProvider } from "@/providers/cityProvider"
import { api } from "@/api"
import { useEffect } from "react"
import { getUser } from "./form/helpers/getData"

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { getCity, setApplication } = useCityProvider()
  const city = getCity()  

  const getApplication = async () => {
    const email = getUser()
    if(!email) return null
    const result = await api.get(`applications?email=${email}`)
    
    if(result.status === 200) {
      return result.data?.[result.data.length - 1]
    }

    return null
  }

  useEffect(() => {
    getApplication().then(setApplication)
  }, [])

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
          <main className="flex-1 p-6 w-[100%]">{children}</main>
        </SidebarInset>
      </div>
    </Authentication>
  )
}

