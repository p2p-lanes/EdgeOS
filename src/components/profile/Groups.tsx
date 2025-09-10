import { Card } from "../ui/card"
import useGetGroups from "../Sidebar/hooks/useGetGroups"
import { Button } from "../ui/button"
import { SquareArrowOutUpRight, User } from "lucide-react"
import { useRouter } from "next/navigation"

const Groups = () => {
  const { groups } = useGetGroups()
  const router = useRouter()

  if(groups.length === 0) return null

  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-8">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">My Groups</h2>
        <p className="text-gray-600">Groups you're part of across different Pop-ups</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group, index) => (
            <Card key={index} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-2">
                  <h3 className="font-semibold text-gray-900">{group.name}</h3>
                  <p className="text-sm text-gray-600 font-medium">{group.popup_name}</p>
                  {/* <div className="flex items-center gap-2 text-sm text-gray-700">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>
                      {group.members } / {group.max_members} members
                    </span>
                  </div> */}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-fit flex items-center justify-center"
                  onClick={() => router.push(`/portal/${group.popup_city_slug}/groups/${group.id}`)}
                >
                  <SquareArrowOutUpRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
export default Groups