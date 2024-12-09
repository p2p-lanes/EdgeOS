import { useEffect } from "react"
import { useCityProvider } from "@/providers/cityProvider"
import { api } from "@/api"
import useGetTokenAuth from "./useGetTokenAuth"
import useAuthentication from "./useAuthentication"

const useGetApplications = () => {
  const { setApplications } = useCityProvider()

  const { user } = useGetTokenAuth()
  const { logout } = useAuthentication()

  const getApplicationsApi = async () => {
    if(!user || !user.email) return null

    try{
      const response = await api.get(`applications?email=${user.email}`)

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
    getApplicationsApi()
  }, [user])
}
export default useGetApplications