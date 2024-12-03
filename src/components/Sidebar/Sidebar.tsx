"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useCityProvider } from "@/providers/cityProvider"
import { getToken } from "@/helpers/getToken"
import useAuthentication from "@/hooks/useAuthentication"
import PopupsMenu from "./PopupsMenu"
import FooterMenu from "./FooterMenu"
import ResourcesMenu from "./ResourcesMenu"
import { Sidebar } from "./SidebarComponents"
import { Loader } from "../ui/Loader"


export function BackofficeSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setCity } = useCityProvider()
  const router = useRouter()
  const { logout } = useAuthentication()

  const token = getToken()

  const handleClickCity = (city: any) => {
    setCity(city)
    router.push(`/portal/${city.slug}`)
  }

  if(!token) return <Loader />

  return (
    <Sidebar {...props}>
      <PopupsMenu handleClickCity={handleClickCity}/>
      <ResourcesMenu/>
      <FooterMenu handleLogout={logout} token={token}/>
    </Sidebar>
  )
}

