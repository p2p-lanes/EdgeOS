import { LogOut, ChevronDown } from "lucide-react"

import { DropdownMenuItem, DropdownMenuContent, DropdownMenu, DropdownMenuTrigger } from "./DropdownMenu"
import { AvatarFallback, AvatarImage, Avatar } from "../ui/avatar"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "./SidebarComponents"

import { User } from "@/types/User"

const FooterMenu = ({handleLogout, user}: {handleLogout: () => void, user: User}) => {
  return (
    <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild  onClick={() => console.log('handlechang')}>
                <SidebarMenuButton size="lg" onClick={() => console.log('handlechang1')}>
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage src="/avatars/01.png" alt="Avatar" />
                    <AvatarFallback className="rounded-lg">{user?.email?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 text-sm">
                    <span className="text-xs font-semibold">{user?.email}</span>
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
  )
}
export default FooterMenu