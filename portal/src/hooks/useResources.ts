import { FileText, Users } from "lucide-react"
import { useApplication } from "@/providers/applicationProvider"
import { useCityProvider } from "@/providers/cityProvider"
import type { Resource } from "@/types/resources"

const useResources = () => {
  const { getCity } = useCityProvider()
  const { getRelevantApplication } = useApplication()
  const application = getRelevantApplication()
  const city = getCity()

  const canSeeAttendees = application?.status === "accepted"
  console.log(canSeeAttendees)

  const resources: Resource[] = [
    {
      name: "Application",
      icon: FileText,
      status: "active",
      path: `/portal/${city?.slug}`,
      children: [
        {
          name: "Status",
          status: "inactive",
          value: application?.status ?? "not started",
        },
      ],
    },
    {
      name: "Attendee Directory",
      icon: Users,
      status: canSeeAttendees ? "active" : "hidden",
      path: `/portal/${city?.slug}/attendees`,
    },
  ]

  return { resources }
}
export default useResources
