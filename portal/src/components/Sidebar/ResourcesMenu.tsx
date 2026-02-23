import { useRouter } from "next/navigation"
import { useCallback } from "react"
import useResources from "@/hooks/useResources"
import type { Resource } from "@/types/resources"
import { Separator } from "../ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import GroupsResources from "./Groups/GroupsResources"
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
} from "./SidebarComponents"
import ResourceMenuItem from "./StatusResource/ResourceMenuItem"

const statusColor = (status: string) => {
  if (status === "pending") return "bg-yellow-100 text-yellow-800"
  if (status === "in review") return "bg-blue-100 text-blue-800"
  if (status === "accepted") return "bg-green-100 text-green-800"
  if (status === "rejected") return "bg-red-100 text-red-800"
  if (status === "withdrawn") return "bg-slate-300 text-slate-700"
  return "bg-gray-100 text-gray-800"
}

const ResourceItem: React.FC<{
  resource: Resource
  level?: number
  onNavigate: (path: string) => void
}> = ({ resource, level = 0, onNavigate }) => {
  return (
    <SidebarMenuItem>
      <Tooltip>
        <TooltipTrigger asChild>
          <ResourceMenuItem
            resource={resource}
            level={level}
            color={statusColor(resource.value as string)}
            onNavigate={onNavigate}
          />
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="hidden group-data-[collapsible=icon]:block"
        >
          {resource.name} {resource.status === "soon" ? "(Coming Soon)" : ""}
        </TooltipContent>
      </Tooltip>

      {resource.children && (
        <SidebarMenuSub>
          {resource.children.map((child) => (
            <ResourceItem
              key={child.name}
              resource={child}
              level={level + 1}
              onNavigate={onNavigate}
            />
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  )
}

const ResourcesMenu = () => {
  const { resources } = useResources()
  const router = useRouter()

  const handleNavigate = useCallback(
    (path: string) => {
      router.push(path)
    },
    [router],
  )

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Your Participation</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {resources.map((resource) => (
              <ResourceItem
                key={resource.name}
                resource={resource}
                onNavigate={handleNavigate}
              />
            ))}
            <Separator className="my-4" />
            <GroupsResources onNavigate={handleNavigate} />
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  )
}
export default ResourcesMenu
