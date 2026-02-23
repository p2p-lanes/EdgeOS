import type { HumanPublic } from "@edgeos/api-client"
import { Calendar1, MapPinned, Speech } from "lucide-react"
import { Card } from "../ui/card"

// LEGACY: popups, total_days, referral_count removed from API – review for deletion
const StatsCards = ({
  userData: _userData,
}: {
  userData: HumanPublic | null
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Pop-ups attended</p>
            <p className="text-3xl font-bold text-gray-900">—</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <MapPinned className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Days at Edge</p>
            <p className="text-3xl font-bold text-gray-900">—</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar1 className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Referrals</p>
            <p className="text-3xl font-bold text-gray-900">—</p>
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
