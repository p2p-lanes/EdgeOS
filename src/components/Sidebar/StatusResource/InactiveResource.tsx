import { Resource } from "@/types/resources"

const InactiveResource = ({resource, level, color}: {resource: Resource, level: number, color: string}) => {
  return (
    <div className={`flex items-center justify-between cursor-default ${level > 0 ? 'pl-6' : ''}`}>
      {resource.icon && <resource.icon className="size-4 mr-2" />}
      <span className="group-data-[collapsible=icon]:hidden">{resource.name}</span>
      {resource.value && (
        <span className={`ml-auto text-xs ${color} px-2 py-1 rounded-full`}>
          {resource.value}
        </span>
      )}
    </div>
  )
}
export default InactiveResource