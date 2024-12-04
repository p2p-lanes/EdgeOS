import { useEffect } from "react"
import { useCityProvider } from "@/providers/cityProvider"
import { api } from "@/api"
import useGetTokenAuth from "./useGetTokenAuth"

const useGetApplications = () => {
  const { setApplications, getApplications } = useCityProvider()
  const applications = getApplications()
  const { user } = useGetTokenAuth()

  const getApplicationsApi = async () => {
    const email = user?.email

    if(applications && applications.length > 0) return applications
    
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