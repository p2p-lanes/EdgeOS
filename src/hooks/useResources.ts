import { useApplication } from "@/providers/applicationProvider"
import { useCityProvider } from "@/providers/cityProvider"
import { Resource } from "@/types/resources"
import { CircleDot, FileText, Home, Tag, Ticket, User, Users } from "lucide-react"

const useResources = () => {
  const { getCity } = useCityProvider()
  const { getRelevantApplication } = useApplication()
  const application = getRelevantApplication()
  const city = getCity()

  const isEdge = city?.slug === 'edge-esmeralda' || city?.slug === 'buenos-aires'
  const isEdgeAustin = city?.slug === 'edge-austin'

  const canSeeAttendees = application?.status === 'accepted' && isEdge

  const resources: Resource[] = [
    {
      name: 'Application',
      icon: FileText,
      status: 'active',
      path: `/portal/${city?.slug}`,
      children: [
        {
          name: 'Status',
          status: 'inactive',
          value: application?.status ?? 'not started'
        }
      ]
    },
    {
      name: 'Passes',
      icon: Ticket,
      status: application?.status === 'accepted' ? 'active' : 'disabled',
      path: `/portal/${city?.slug}/passes`,
    },
    // {
    //   name: 'Attendee Directory', 
    //   icon: Users,
    //   status: canSeeAttendees ? 'active' : 'hidden',
    //   path: `/portal/${city?.slug}/attendees`,
    // },
    {
      name: 'Housing',
      icon: Home,
      status: isEdgeAustin ? 'hidden' : 'soon' as const
    }
  ]

  return ({resources})
}
export default useResources