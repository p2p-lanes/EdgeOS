import { Star, Github, User } from "lucide-react"
import { useState, useEffect } from "react"

import { SidebarMenu, SidebarMenuItem, SidebarFooter } from "./SidebarComponents"

import { User as UserType } from "@/types/User"
import PoapMint from "./Poap/PoapMint"
import Link from "next/link"

const FooterMenu = ({handleLogout, user}: {handleLogout: () => void, user: UserType}) => {
  const [stars, setStars] = useState<number | null>(null)
  const repoUrl = "https://github.com/p2p-lanes/EdgeOS"

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
             <Link href={"/portal/profile"}>
              <div className="flex items-center gap-4 p-2 px-4 hover:bg-gray-100 hover:text-gray-700 text-muted-foreground rounded-lg transition-colors cursor-pointer mb-4 mt-4">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">
                  My Profile
                </span>
              </div>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
  )
}
export default FooterMenu