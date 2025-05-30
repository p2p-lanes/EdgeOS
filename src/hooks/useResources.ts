import { useApplication } from "@/providers/applicationProvider"
import { useCityProvider } from "@/providers/cityProvider"
import { Resource } from "@/types/resources"
import { FileText, Home, Ticket, Users } from "lucide-react"

const useResources = () => {
  const { getCity } = useCityProvider()
  const { getRelevantApplication } = useApplication()
  const application = getRelevantApplication()
  const city = getCity()

  const isEdge = city?.slug === 'edge-esmeralda' || city?.slug === 'buenos-aires'
  const isEdgeAustin = city?.slug === 'edge-austin'
  const applicationAccepted = application?.status === 'accepted'
  const canSeeAttendees = applicationAccepted && isEdge

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
      status: applicationAccepted ? 'active' : 'disabled',
      path: `/portal/${city?.slug}/passes`,
      children: [
        {
          name: 'ZK Email discounts',
          status: isEdge && applicationAccepted ? 'active' : !applicationAccepted ? 'disabled' : 'hidden',
          path: `/portal/${city?.slug}/coupons`
        }
      ]
    },
    {
      name: 'Attendee Directory', 
      icon: Users,
      status: canSeeAttendees ? 'active' : 'hidden',
      path: `/portal/${city?.slug}/attendees`,
    },
    // {
    //   name: 'Housing',
    //   icon: Home,
    //   status: isEdgeAustin ? 'hidden' : 'soon' as const
    // }
  ]

  return ({resources})
}
export default useResources