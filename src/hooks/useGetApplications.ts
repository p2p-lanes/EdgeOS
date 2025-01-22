import { useEffect } from "react"
import { useCityProvider } from "@/providers/cityProvider"
import { api } from "@/api"
import useGetTokenAuth from "./useGetTokenAuth"
import useAuthentication from "./useAuthentication"
import { useApplication } from "@/providers/applicationProvider"

const useGetApplications = (autoFetch = true) => {
  const { setApplications } = useApplication()
  
  const { user } = useGetTokenAuth()
  const { logout } = useAuthentication()

  const getApplicationsApi = async () => {
    if(!user || !user.email) return null

    try{
      const response = await api.get(`applications?email=${encodeURIComponent(user.email)}`)

      if(response.status === 200) {
        setApplications(response.data)
      }
    } catch(err: any) {
      if(err.response?.status === 401) {
        logout()
      }
    }
    return null
  }

  useEffect(() => {
    if(autoFetch){
      getApplicationsApi()
    }
  }, [user, autoFetch])

  return getApplicationsApi;
}
export default useGetApplications