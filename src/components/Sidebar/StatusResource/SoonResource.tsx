import { Resource } from "@/types/resources"
import { SidebarMenuButton } from "../SidebarComponents"

const SoonResource = ({ resource, level, color }: { resource: Resource, level: number, color: string }) => {
  return (
    <SidebarMenuButton 
      disabled={true}
      className={`py-5 opacity-50 cursor-not-allowed ${level > 0 ? 'pl-6' : ''}`}
    >
      {resource.icon && <resource.icon className="size-4 mr-2" />}
      <span className="group-data-[collapsible=icon]:hidden">{resource.name}</span>
      <span className="ml-auto text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md group-data-[collapsible=icon]:hidden">
        Soon
      </span>
      {resource.value && (
        <span className={`ml-auto text-xs ${color} px-2 py-1 rounded-full`}>
          {resource.value}
        </span>
      )}
    </SidebarMenuButton>
  )
}
export default SoonResource