import { useCityProvider } from "@/providers/cityProvider"
import { Resource } from "@/types/resources"
import { CircleDot, FileText, Home, Tag, Ticket, User } from "lucide-react"

const useResources = () => {
  const { getRelevantApplication } = useCityProvider()
  const application = getRelevantApplication()

  const resources: Resource[] = [
  {
    name: 'Application',
    icon: FileText,
    status: 'active',
    path: '/portal',
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
    status: 'soon',
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