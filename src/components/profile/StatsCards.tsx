import { CitizenProfile } from "@/types/Profile"
import { House, Calendar, Users, MapPinned, CalendarDays, Speech } from "lucide-react"
import { Card } from "../ui/card"

const StatsCards = ({userData}: {userData: CitizenProfile | null}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="p-6 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Pop-ups attended</p>
            <p className="text-3xl font-bold text-gray-900">{userData?.popups?.length ?? 0}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <MapPinned className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Days at Edge</p>
            <p className="text-3xl font-bold text-gray-900">{userData?.total_days ?? 0}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <CalendarDays className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Referrals</p>
            <p className="text-3xl font-bold text-gray-900">10</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Speech className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </Card>
    </div>
  )
}
export default StatsCards