import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"
import { PopupSelector } from "./PopupSelector"
import { TenantSelector } from "./TenantSelector"

export function WorkspaceSelector() {
  const { isSuperadmin, user } = useAuth()
  const { state } = useSidebar()

  // Don't render if user not loaded yet or sidebar is collapsed
  if (!user || state === "collapsed") return null

  return (
    <SidebarGroup className="pb-2">
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      <SidebarGroupContent className="flex flex-col gap-3 px-2 min-w-0">
        {isSuperadmin && <TenantSelector />}
        <PopupSelector />
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
