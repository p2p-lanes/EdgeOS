import { Github, Star, User } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./SidebarComponents"

const REPO_URL = "https://github.com/p2p-lanes/EdgeOS"

async function getGitHubStars() {
  try {
    const response = await fetch(
      "https://api.github.com/repos/p2p-lanes/EdgeOS",
    )
    const data = await response.json()
    return data.stargazers_count as number
  } catch (error) {
    console.error("Error fetching GitHub stars:", error)
    return null
  }
}

const FooterMenu = () => {
  const [stars, setStars] = useState<number | null>(null)

  useEffect(() => {
    const fetchStars = async () => {
      const count = await getGitHubStars()
      setStars(count)
    }

    fetchStars()
  }, [])

  return (
    <SidebarFooter>
      <SidebarMenu>
        {stars !== null && (
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                <Github className="size-4 text-muted-foreground" />
                <span className="ml-3 text-xs font-semibold text-muted-foreground group-data-[collapsible=icon]:hidden">
                  EdgeOS
                </span>
                <div className="ml-auto flex items-center gap-1 group-data-[collapsible=icon]:hidden">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-medium">{stars}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link
              href="/portal/profile"
              className="mb-4 mt-4 text-muted-foreground"
            >
              <User className="size-4" />
              <span className="text-sm font-medium">My Profile</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  )
}
export default FooterMenu
