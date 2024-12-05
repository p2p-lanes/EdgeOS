import { Resource } from "@/types/resources"
import { SidebarMenuButton } from "../SidebarComponents"

const ActiveResource = ({ resource, handleClickPath, level, color }: { resource: Resource, handleClickPath: (path: string) => void, level: number, color: string }) => {
  return (
    <SidebarMenuButton
      onClick={() => handleClickPath(resource.path ?? '')}
      className={`py-5 ${level > 0 ? 'pl-6' : ''}`}
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