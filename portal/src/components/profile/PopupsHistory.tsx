import type { PopupPublic } from "@edgeos/api-client"
import { Calendar, Clock, MapPin } from "lucide-react"
import Image from "next/image"
import { useApplication } from "@/providers/applicationProvider"
import { useCityProvider } from "@/providers/cityProvider"
import { Card } from "../ui/card"

// LEGACY: CitizenProfilePopup removed from API – popups history endpoint no longer exists
type LegacyProfilePopup = {
  popup_name: string
  start_date: string
  end_date: string
  total_days: number
  location?: string | null
  image_url?: string | null
}

type ApplicationStatus = "draft" | "in review" | "accepted" | "rejected"

interface PopupWithApplicationStatus extends LegacyProfilePopup {
  application_status?: ApplicationStatus
}

const PopupsHistory = ({ popups }: { popups: LegacyProfilePopup[] }) => {
  const { applications } = useApplication()
  const { getPopups } = useCityProvider()
  const allPopups = getPopups()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const _getPopupStatus = (startDate: string, endDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (now > end) {
      return { label: "Completed", className: "bg-green-100 text-green-800" }
    }
    if (now >= start && now <= end) {
      return { label: "In progress", className: "bg-blue-100 text-blue-800" }
    }
    return { label: "Upcoming", className: "bg-gray-100 text-gray-800" }
  }

  const getApplicationStatusBadge = (status?: string) => {
    switch (status) {
      case "accepted":
        return {
          label: "Application Approved",
          className: "bg-green-100 text-green-800",
        }
      case "in review":
        return {
          label: "Application Submitted",
          className: "bg-blue-100 text-blue-800",
        }
      case "draft":
        return {
          label: "Application Draft",
          className: "bg-gray-100 text-gray-800",
        }
      default:
        return { label: "Upcoming", className: "bg-gray-100 text-gray-800" }
    }
  }

  // Filter applications where ALL attendees have NO products
  const applicationsWithoutProducts =
    applications?.filter((app) =>
      (app.attendees ?? []).every(
        (attendee) =>
          (attendee.products as any[] | undefined)?.length !== undefined,
      ),
    ) ?? []

  // Map applications to popup data for upcoming popups with application status
  const upcomingPopupsFromApplications = applicationsWithoutProducts
    .map((app) => {
      const popup = allPopups.find((p: PopupPublic) => p.id === app.popup_id)
      if (!popup) return null

      return {
        popup_name: popup.name,
        start_date: popup.start_date ?? "",
        end_date: popup.end_date ?? "",
        total_days: 0,
        // LEGACY: location removed from API – review for deletion
        location: null,
        image_url: popup.image_url,
        application_status: app.status,
      } as PopupWithApplicationStatus
    })
    .filter((p): p is PopupWithApplicationStatus => p !== null)
    .filter((popup) => new Date(popup.end_date) > new Date()) // Only show upcoming events
    .sort(
      (a, b) =>
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
    ) // Sort by most recent first

  const pastPopups = popups
    .filter((popup) => new Date(popup.end_date) < new Date())
    .filter(
      (popup, index, self) =>
        index === self.findIndex((t) => t.popup_name === popup.popup_name),
    )
    .sort(
      (a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
    )

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Pop-Ups</h2>
        <p className="text-sm text-gray-600">Your upcoming and past Pop-Ups</p>
      </div>

      <div className="py-2">
        <div className="space-y-6">
          {popups.length === 0 && (
            <div className="text-center text-gray-600 p-4">No events found</div>
          )}
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-6 h-6 text-foreground" />
            <h4 className="text-md font-semibold text-foreground">
              Upcoming Pop-Ups
            </h4>
          </div>
          <div className="space-y-4">
            {upcomingPopupsFromApplications.length === 0 && (
              <div className="text-center text-gray-600 p-4">
                No upcoming events found
              </div>
            )}
            {upcomingPopupsFromApplications.map((popup, _index) => (
              <div
                key={popup.popup_name}
                className="flex items-center gap-4 p-4 border border-[#e2e8f0] rounded-lg"
              >
                <Image
                  src={popup.image_url || "/placeholder.svg"}
                  alt={popup.popup_name}
                  width={70}
                  height={70}
                  className="object-cover aspect-square rounded-lg"
                />
                <div className="flex-1">
                  <h5 className="text-xl font-semibold text-foreground mb-2">
                    {popup.popup_name}
                  </h5>
                  <div className="flex items-center gap-4 text-xs text-[#64748b]">
                    {popup.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-black" />
                        <span className="text-sm">
                          {popup.location?.charAt(0).toUpperCase() +
                            popup.location?.slice(1)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-black" />
                      <span className="text-sm">
                        {formatDate(popup.start_date)} -{" "}
                        {formatDate(popup.end_date)}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded text-xs font-medium ${getApplicationStatusBadge(popup.application_status).className}`}
                >
                  {getApplicationStatusBadge(popup.application_status).label}
                </div>
              </div>
            ))}
          </div>

          <div className="h-px w-full bg-gray-200" />

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-6 h-6 text-foreground" />
              <h4 className="text-md font-semibold text-foreground">
                Past Pop-Ups
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pastPopups.length === 0 && (
                <div className="text-center text-gray-600 p-4 col-span-3">
                  No past events found
                </div>
              )}
              {pastPopups.map((popup) => (
                <Card key={popup.popup_name} className="p-4">
                  <div className="relative mb-3">
                    <Image
                      src={popup.image_url || "/placeholder.svg"}
                      alt={popup.popup_name}
                      width={160}
                      height={160}
                      className="w-full h-auto max-h-[140px] object-cover rounded-lg aspect-auto object-top"
                    />
                    {/* <div className="absolute top-2 left-2 bg-[#dcfce7] text-[#166534] px-2 py-1 rounded text-xs font-medium">
                      Completed
                    </div> */}
                  </div>
                  <div>
                    <h5 className="text-lg font-semibold text-black mb-2">
                      {popup.popup_name}
                    </h5>
                    <div className="space-y-2 text-xs text-[#64748b] mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-black" />
                        <span className="text-sm">{popup.location}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-black" />
                        <span className="text-sm">
                          {formatDate(popup.start_date)} -{" "}
                          {formatDate(popup.end_date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-black" />
                        <span className="text-sm">
                          {popup.total_days} days attended
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default PopupsHistory
