import { Users } from "lucide-react"
import { useCityProvider } from "@/providers/cityProvider"
import useGetGroups from "../hooks/useGetGroups"
import ResourceMenuItem from "../StatusResource/ResourceMenuItem"

const GroupsResources = ({
  onNavigate,
}: {
  onNavigate: (path: string) => void
}) => {
  const { data: groups = [], isLoading } = useGetGroups()
  const { getCity } = useCityProvider()
  const city = getCity()

  if (isLoading) return null

  const filteredGroups = groups.filter((group) => group.popup_id === city?.id)

  return (
    <div className="ml-2 flex flex-col">
      {filteredGroups.length > 0 && (
        <p className="mb-2 text-xs font-medium text-gray-500">Groups</p>
      )}
      {filteredGroups.map((group) => (
        <ResourceMenuItem
          key={group.id}
          resource={{
            name: group.name,
            icon: Users,
            status: "active",
            path: `/portal/${city?.slug}/groups/${group.id}`,
          }}
          level={0}
          color="bg-gray-100 text-gray-800"
          onNavigate={onNavigate}
          isGroup
        />
      ))}
    </div>
  )
}
export default GroupsResources
