"use client"

import * as React from "react"
import { AudioWaveform, ChevronDown, ChevronsUpDown, Command, FileText, Home, LayoutDashboard, LogOut, Settings2, Ticket, User } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"
import { useCityProvider } from "@/providers/cityProvider"
import useGetPopups from "@/app/portal/hooks/useGetPopups"
import { useEffect, useState } from "react"
import { getUser } from "@/app/portal/form/helpers/getData"
import { api } from "@/api"

const projects = [
  {
    name: "Edge Esmeralda",
    logo: Command,
    plan: "Enterprise",
  },
  {
    name: "Edge Aria",
    logo: AudioWaveform,
    plan: "Pro",
  },
]

export function BackofficeSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {popups} = useGetPopups()
  const { getCity, setCity, getApplication } = useCityProvider()
  const router = useRouter()
  const city = getCity()
  const application = getApplication()

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/auth')
  }

  useEffect(() => {
    if(popups.length > 0) {
      setCity(popups[0])
    }
  }, [popups])

  const statusColor = (status: string) => {
    if(status === 'pending') return 'bg-yellow-100 text-yellow-800'
    if(status === 'approved') return 'bg-green-100 text-green-800'
    return 'bg-gray-100 text-gray-800'
  }


  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="w-full justify-between">
                  {!popups.length || !city ? (
                    <div className="flex items-center gap-3">
                      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gray-200 animate-pulse" />
                      <div className="flex flex-col gap-0.5">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        {/* <activeProject.logo className="size-4" /> */}
                      </div>
                      <div className="flex flex-col gap-0.5 text-sm">
                        <span className="font-semibold">{city.name}</span>
                        <span className="text-xs text-muted-foreground">{city.location}</span>
                        <span className="text-xs text-muted-foreground">{new Date(city.start_date)?.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>

                      </div>
                    </div>
                  )}
                  <ChevronsUpDown className="size-4 opacity-50" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
                {popups.map((city) => (
                  <DropdownMenuItem key={city.name} onClick={() => setCity(city)}>
                    {/* <project.logo className="mr-2 size-4" /> */}
                    <span>{city.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Your Participation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton onClick={() => router.push('/portal')}>
                      <FileText className="size-4 mr-2" />
                      <span className="group-data-[collapsible=icon]:hidden">Application</span>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="hidden group-data-[collapsible=icon]:block">Application</TooltipContent>
                </Tooltip>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <div className="flex items-center justify-between py-2 pl-6 text-sm text-muted-foreground cursor-default w-full">
                      <span>Status</span>
                      <span className={`text-xs ${statusColor(application?.status ?? 'not_started')} px-2 py-1 rounded-full`}>{application?.status ?? 'not started'}</span>
                    </div>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton disabled className="opacity-50 cursor-not-allowed">
                      <Ticket className="size-4 mr-2" />
                      <span className="group-data-[collapsible=icon]:hidden">Passes</span>
                      <span className="ml-auto text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md group-data-[collapsible=icon]:hidden">Soon</span>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="hidden group-data-[collapsible=icon]:block">Passes</TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton disabled className="opacity-50 cursor-not-allowed">
                      <Home className="size-4 mr-2" />
                      <span className="group-data-[collapsible=icon]:hidden">Housing</span>
                      <span className="ml-auto text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md group-data-[collapsible=icon]:hidden">Soon</span>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="hidden group-data-[collapsible=icon]:block">Housing (Coming Soon)</TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage src="/avatars/01.png" alt="Avatar" />
                    <AvatarFallback className="rounded-lg">CP</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 text-sm">
                    <span className="font-semibold">admin</span>
                    <span className="text-xs text-muted-foreground">admin@example.com</span>
                  </div>
                  <ChevronDown className="ml-auto size-4 opacity-50" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 size-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

