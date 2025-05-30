import { LogOut, ChevronDown, Star, Github, Medal } from "lucide-react"
import { useState, useEffect } from "react"

import { DropdownMenuItem, DropdownMenuContent, DropdownMenu, DropdownMenuTrigger } from "./DropdownMenu"
import { AvatarFallback, AvatarImage, Avatar } from "../ui/avatar"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "./SidebarComponents"

import { User } from "@/types/User"
import PoapMint from "./Poap/PoapMint"
import { usePoapsProvider } from "@/providers/poapsProvider"
import { useRouter } from "next/navigation"

const FooterMenu = ({handleLogout, user}: {handleLogout: () => void, user: User}) => {
  const [stars, setStars] = useState<number | null>(null)
  const repoUrl = "https://github.com/p2p-lanes/EdgeOS"
  const router = useRouter()

  async function getGitHubStars() {
    try {
      const owner = 'p2p-lanes'
      const repo = 'EdgeOS'
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
      const data = await response.json()
      return data.stargazers_count
    } catch (error) {
      console.error("Error fetching GitHub stars:", error)
      return null
    }
  }

  useEffect(() => {
    const fetchStars = async () => {
      const count = await getGitHubStars()
      setStars(count)
    }
    
    fetchStars()
  }, [])

  return (
    <SidebarFooter>
        <PoapMint />
        <SidebarMenu>
          {stars !== null && (
            <a 
              href={repoUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className="group-data-[collapsible=icon]:px-0 flex items-center gap-2 text-xs px-2 py-2 hover:bg-muted/50 rounded-md transition-colors duration-200 mx-2 mb-2"
            >
              <div className="flex items-center gap-1">
                <Github className="size-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground group-data-[collapsible=icon]:hidden ml-3">EdgeOS</span>
              </div>
              <div className="flex items-center gap-1 ml-auto group-data-[collapsible=icon]:hidden">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                <span className="font-medium">{stars}</span>
              </div>
            </a>
          )}
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
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
                <DropdownMenuItem onClick={() => router.push('/portal/poaps')} className="cursor-pointer my-2 py-2">
                  <Medal className="mr-2 size-4" />
                  <span>My Collectibles</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer my-2 py-2">
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