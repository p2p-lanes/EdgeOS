'use client'

import { DropdownMenu, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./SidebarComponents"
import { useCityProvider } from "@/providers/cityProvider"
import { PopupsProps } from "@/types/Popup"
import { ChevronsUpDown } from 'lucide-react'
import { DropdownMenuContent, DropdownMenuItem } from "./DropdownMenu"
import { Avatar, AvatarFallback } from "../ui/avatar"
import useWindow from "@/hooks/useWindow"
import { useEffect, useState } from "react"

const PopupsMenu = ({ handleClickCity }: { handleClickCity: (city: PopupsProps) => void }) => {
  const { getCity, getPopups } = useCityProvider()
  const [cityDate, setCityDate] = useState('')
  const city = getCity()
  const popups = getPopups()
  const { isClient } = useWindow()
  const cityName = `${city?.name?.split(' ')?.[0]?.[0].toUpperCase()}${city?.name?.split(' ')?.[1]?.[0].toUpperCase()}`

  useEffect(() => {
    if(!isClient || !city?.start_date) return;

    const cityDate = new Date(city.start_date).toLocaleDateString('en-EN', {day: 'numeric', month: 'long', year: 'numeric'})
    setCityDate(cityDate)
  }, [city?.start_date, isClient])

  return (
    <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="w-full h-full justify-between">
                  {!popups.length || !city ? (
                    <div className="flex items-center gap-3">
                      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gray-200 animate-pulse" />
                      <div className="flex flex-col gap-0.5">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                        <Avatar className="size-10 rounded-xl" >
                          <AvatarFallback className='rounded-xl bg-slate-400 text-white font-semibold'>{cityName}</AvatarFallback>
                        </Avatar>
                      <div className="flex flex-col gap-0.5 text-sm">
                        <span className="font-semibold">{city.name}</span>
                        <span className="text-xs text-muted-foreground">{city.location}</span>
                        <span className="text-xs text-muted-foreground">{cityDate}</span>
                      </div>
                    </div>
                  )}
                  <ChevronsUpDown className="size-4 opacity-50" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
                {popups.map((popup: PopupsProps) => {
                  return (
                    <DropdownMenuItem key={popup.name} className="cursor-pointer" disabled={!popup.clickable_in_portal} onClick={() => handleClickCity(popup)}>
                      <span>{popup.name}</span>
                      {
                        !popup.clickable_in_portal && (
                          <span className="ml-auto text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md">Soon</span>
                        )
                      }
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
  )
}
export default PopupsMenu