import { Users } from "lucide-react";
import useGetGroups from "../hooks/useGetGroups"
import ActiveResource from "../StatusResource/ActiveResource";
import { useCityProvider } from "@/providers/cityProvider";
import { useRouter } from "next/navigation";

const GroupsResources = () => {
  const { groups, isLoading } = useGetGroups()
  const { getCity } = useCityProvider()
  const city = getCity()
  const router = useRouter()
  
  const handleClickPath = (path?: string) => {
    if(path) router.push(path)
  }
  
  if(isLoading) return;
  
  return (
    <div className="flex flex-col ml-2">
      {
        groups.length > 0 && (
          <p className="text-xs font-medium text-gray-500 mb-2">Groups</p>
        )
      }
      {groups.map((group) => (
        <ActiveResource 
          key={group.id} 
          resource={{
            name: group.name,
            icon: Users,
            status: 'active',
            path: `/portal/${city?.slug}/groups/${group.id}`,
          }} 
          handleClickPath={handleClickPath} 
          level={0} 
          color="bg-gray-100 text-gray-800" 
          isGroup={true}
        />
      ))}
    </div>
  )
}
export default GroupsResources