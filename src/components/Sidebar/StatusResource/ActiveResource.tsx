import { Resource } from "@/types/resources"
import { SidebarMenuButton } from "../SidebarComponents"
import { cn } from "@/lib/utils"

const ActiveResource = ({ resource, handleClickPath, level, color, isGroup = false }: { resource: Resource, handleClickPath: (path: string) => void, level: number, color: string, isGroup?: boolean }) => {
  const isActive = resource.status === 'active'
  
  const handleClick = () => {
    if(isActive){
      handleClickPath(resource.path ?? '')
    }
  }
  
  return (
    <SidebarMenuButton
      onClick={handleClick}
      className={cn(isGroup ? 'py-2' : 'py-5', !isActive && 'opacity-50', level > 0 && 'pl-6')}
      data-testid={`sidebar-${resource.name.toLowerCase().replace(/\s+/g, '-')}-button`}
    >
      {resource.icon && <resource.icon className="size-4 mr-2" />}
      <span className="group-data-[collapsible=icon]:hidden">{resource.name}</span>
      {resource.value && (
        <span className={`ml-auto text-xs ${color} px-2 py-1 rounded-full`}>
          {resource.value}
        </span>
      )}
    </SidebarMenuButton>
  )
}
export default ActiveResource