import { cn } from "@/lib/utils"
import type { Resource } from "@/types/resources"
import { SidebarMenuButton } from "../SidebarComponents"

interface ResourceMenuItemProps {
  resource: Resource
  level?: number
  color: string
  onNavigate: (path: string) => void
  isGroup?: boolean
}

const ResourceMenuItem = ({
  resource,
  level = 0,
  color,
  onNavigate,
  isGroup = false,
}: ResourceMenuItemProps) => {
  const { status } = resource

  const handleClick = () => {
    if (status === "active" && resource.path) {
      onNavigate(resource.path)
    }
  }

  if (status === "inactive") {
    return (
      <SidebarMenuButton
        className={cn(
          "pointer-events-none cursor-default",
          isGroup ? "py-2" : "py-5",
          level > 0 && "pl-6",
        )}
      >
        {resource.icon && <resource.icon className="mr-2 size-4" />}
        <span className="group-data-[collapsible=icon]:hidden">
          {resource.name}
        </span>
        {resource.value && (
          <span className={cn("ml-auto rounded-full px-2 py-1 text-xs", color)}>
            {resource.value}
          </span>
        )}
      </SidebarMenuButton>
    )
  }

  const isDisabled = status === "disabled" || status === "soon"

  return (
    <SidebarMenuButton
      disabled={isDisabled}
      onClick={handleClick}
      className={cn(isGroup ? "py-2" : "py-5", level > 0 && "pl-6")}
    >
      {resource.icon && <resource.icon className="mr-2 size-4" />}
      <span className="group-data-[collapsible=icon]:hidden">
        {resource.name}
      </span>
      {status === "soon" && (
        <span className="ml-auto rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          Soon
        </span>
      )}
      {resource.value && (
        <span className={cn("ml-auto rounded-full px-2 py-1 text-xs", color)}>
          {resource.value}
        </span>
      )}
    </SidebarMenuButton>
  )
}

export default ResourceMenuItem
