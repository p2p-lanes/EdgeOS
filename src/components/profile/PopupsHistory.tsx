import { CitizenProfilePopup } from "@/types/Profile"
import { Calendar, Clock, MapPin } from "lucide-react"
import Image from "next/image"

const PopupsHistory = ( {popups}: {popups: CitizenProfilePopup[]}) => {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getPopupStatus = (startDate: string, endDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (now > end) {
      return { label: "Completed", className: "bg-green-100 text-green-800" }
    }
    if (now >= start && now <= end) {
      return { label: "In progress", className: "bg-blue-100 text-blue-800" }
    }
    return { label: "Incoming", className: "bg-gray-100 text-gray-800" }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Events History</h2>
        <p className="text-gray-600">Your participation in Edge events</p>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          {(popups ?? []).map((popup, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Image
                src={popup.image_url || "/placeholder.svg"}
                alt={popup.popup_name}
                width={160}
                height={120}
                className="w-40 h-30 object-cover rounded-lg"
              />

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{popup.popup_name}</h3>
                  {(() => {
                    const status = getPopupStatus(popup.start_date, popup.end_date)
                    return (
                      <span className={`px-3 py-1 ${status.className} text-sm font-medium rounded-full`}>
                        {status.label}
                      </span>
                    )
                  })()}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{popup.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(popup.start_date)} - {formatDate(popup.end_date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{popup.total_days} days attended</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
export default PopupsHistory