import { useCityProvider } from "@/providers/cityProvider"
import { Resource } from "@/types/resources"
import { CircleDot, FileText, Home, Tag, Ticket, User } from "lucide-react"

const useResources = () => {
  const { getRelevantApplication, getCity } = useCityProvider()
  const application = getRelevantApplication()
  const city = getCity()

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
  {
    name: 'Housing',
    icon: Home,
    status: 'soon'
  }
]


  return ({resources})
}
export default useResources