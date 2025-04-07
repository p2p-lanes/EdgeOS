import { SidebarGroupContent, SidebarGroup, SidebarContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubItem } from "./SidebarComponents"
import { useRouter, usePathname } from "next/navigation"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { Resource } from "@/types/resources"
import useResources from "@/hooks/useResources"
import ActiveResource from "./StatusResource/ActiveResource"
import SoonResource from "./StatusResource/SoonResource"
import InactiveResource from "./StatusResource/InactiveResource"
import DisabledResource from "./StatusResource/DisabledResource"
import { Separator } from "../ui/separator"
import GroupsResources from "./Groups/GroupsResources"
import { useState, useEffect, useCallback } from "react"
import { Loader2 } from "lucide-react"

const statusColor = (status: string) => {
  if(status === 'pending') return 'bg-yellow-100 text-yellow-800'
  if(status === 'in review') return 'bg-blue-100 text-blue-800'
  if(status === 'accepted') return 'bg-green-100 text-green-800'
  if(status === 'rejected') return 'bg-red-100 text-red-800'
  if(status === 'withdrawn') return 'bg-slate-300 text-slate-700'
  return 'bg-gray-100 text-gray-800'
}

const ResourceMenuItem: React.FC<{ resource: Resource, level?: number }> = ({ resource, level = 0 }) => {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [targetPath, setTargetPath] = useState<string | null>(null)

  // Reset loading state when route changes
  useEffect(() => {
    if (isLoading && targetPath && pathname !== targetPath) {
      setIsLoading(false)
      setTargetPath(null)
    }
  }, [pathname, isLoading, targetPath])

  const handleClickPath = useCallback((path?: string) => {
    if (path) {
      setIsLoading(true)
      setTargetPath(path)
      router.push(path)
    }
  }, [router])

  return(
    <SidebarMenuItem className={isLoading ? "opacity-70 pointer-events-none" : ""}>
      <Tooltip>
        <TooltipTrigger asChild>
          {
            isLoading ? (
              <div className="flex items-center gap-2 px-3 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : resource.status === 'active' ? (
              <ActiveResource resource={resource} handleClickPath={handleClickPath} level={level} color={statusColor(resource.value as string)} />
            ) : resource.status === 'soon' ? (
              <SoonResource resource={resource} level={level} color={statusColor(resource.value as string)} />
            ) : resource.status === 'inactive' ? (
              <InactiveResource resource={resource} level={level} color={statusColor(resource.value as string)} />
            ) :  resource.status === 'disabled' ? (
              <DisabledResource resource={resource} level={level} color={statusColor(resource.value as string)}/>
            ) : null
          }
        </TooltipTrigger>
        <TooltipContent side="right" className="hidden group-data-[collapsible=icon]:block">
          {resource.name} {resource.status === 'soon' ? '(Coming Soon)' : ''}
        </TooltipContent>
      </Tooltip>

      {resource.children && (
        <SidebarMenuSub>
          {resource.children.map((child) => (
            <ResourceMenuItem key={child.name} resource={child} level={level + 1} />
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  )
}

const ResourcesMenu = () => {
  const { resources } = useResources()

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Your Participation</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {resources.map((resource) => (
              <ResourceMenuItem key={resource.name} resource={resource} />
            ))}
            <Separator className="my-4" />
            <GroupsResources />
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  )
}
export default ResourcesMenu