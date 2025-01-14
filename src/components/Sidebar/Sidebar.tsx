"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useCityProvider } from "@/providers/cityProvider"
import useAuthentication from "@/hooks/useAuthentication"
import PopupsMenu from "./PopupsMenu"
import FooterMenu from "./FooterMenu"
import ResourcesMenu from "./ResourcesMenu"
import { Sidebar } from "./SidebarComponents"
import { Loader } from "../ui/Loader"
import useGetTokenAuth from "@/hooks/useGetTokenAuth"


export function BackofficeSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const { logout } = useAuthentication()
  const { user } = useGetTokenAuth()
  

  const handleClickCity = (city: any) => {
    router.replace(`/portal/${city.slug}`)
  }

  if(!user) return <Loader />

  return (
    <Sidebar {...props}>
      <PopupsMenu handleClickCity={handleClickCity}/>
      <ResourcesMenu/>
      <FooterMenu handleLogout={logout} user={user}/>
    </Sidebar>
  )
}

