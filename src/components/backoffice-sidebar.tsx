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
  const router = useRouter()
  const [activeProject, setActiveProject] = React.useState(projects[0])

  const handleLogout = () => {
    // Implement logout logic here
    console.log("Logging out...")
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="w-full justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <activeProject.logo className="size-4" />
                    </div>
                    <div className="flex flex-col gap-0.5 text-sm">
                      <span className="font-semibold">{activeProject.name}</span>
                      <span className="text-xs text-muted-foreground">{activeProject.plan}</span>
                    </div>
                  </div>
                  <ChevronsUpDown className="size-4 opacity-50" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
                {projects.map((project) => (
                  <DropdownMenuItem key={project.name} onClick={() => setActiveProject(project)}>
                    <project.logo className="mr-2 size-4" />
                    <span>{project.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenuButton onClick={() => router.push('/portal')}>
            <Home className="size-4 mr-2 my-2" />
            <span>Portal</span>
          </SidebarMenuButton>
          <SidebarGroupLabel>Your Participation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton>
                      <FileText className="size-4 mr-2" />
                      <span className="group-data-[collapsible=icon]:hidden">Application</span>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="hidden group-data-[collapsible=icon]:block">Application</TooltipContent>
                </Tooltip>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <div className="flex items-center py-2 pl-8 text-sm text-muted-foreground cursor-default">
                      Status
                    </div>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton>
                      <Ticket className="size-4 mr-2" />
                      <span className="group-data-[collapsible=icon]:hidden">Passes</span>
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

