import { SidebarGroupContent, SidebarGroup, SidebarContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubItem } from "./SidebarComponents"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { Resource } from "@/types/resources"
import useResources from "@/hooks/useResources"

const statusColor = (status: string) => {
  if(status === 'pending') return 'bg-yellow-100 text-yellow-800'
  if(status === 'in review') return 'bg-blue-100 text-blue-800'
  if(status === 'accepted') return 'bg-green-100 text-green-800'
  return 'bg-gray-100 text-gray-800'
}

const ResourceMenuItem: React.FC<{ resource: Resource, level?: number }> = ({ resource, level = 0 }) => {
  const router = useRouter()

  const handleClickPath = (path?: string) => {
    if(path) router.push(path)
  }

  return(
    <SidebarMenuItem>
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarMenuButton 
            onClick={resource.status === 'active' ? () => handleClickPath(resource.path) : undefined}
            disabled={resource.status === 'soon'}
            className={`
              ${resource.status === 'inactive' ? 'cursor-default' : ''}
              ${resource.status === 'soon' ? 'opacity-50 cursor-not-allowed' : ''}
              ${level > 0 ? 'pl-6' : ''}
            `}
          >
            {resource.icon && <resource.icon className="size-4 mr-2" />}
            <span className="group-data-[collapsible=icon]:hidden">{resource.name}</span>
            {resource.status === 'soon' && (
              <span className="ml-auto text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md group-data-[collapsible=icon]:hidden">
                Soon
              </span>
            )}
            {resource.value && (
              <span className={`ml-auto text-xs ${statusColor(resource.value as string)} px-2 py-1 rounded-full`}>
                {resource.value}
              </span>
            )}
          </SidebarMenuButton>
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
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  )
}
export default ResourcesMenu