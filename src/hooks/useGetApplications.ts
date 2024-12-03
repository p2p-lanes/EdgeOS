import { useEffect } from "react"
import { useCityProvider } from "@/providers/cityProvider"
import { api } from "@/api"
import { getUser } from "@/app/portal/[popupSlug]/helpers/getData"

const useGetApplications = () => {
  const { setApplications, getApplications } = useCityProvider()
  const applications = getApplications()

  const getApplicationsApi = async () => {
    const email = getUser()

    if(applications) return applications
    
    if(!email) return null
    const result = await api.get(`applications?email=${email}`)
    
    if(result.status === 200) {
      return result.data
    }

    return null
  }

  useEffect(() => {
    getApplicationsApi().then(setApplications)
  }, [])
}
export default useGetApplications