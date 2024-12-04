import { api } from "@/api"
import { useCityProvider } from "@/providers/cityProvider"
import { filterAcceptedApplications, filterApplications } from "../helpers/filters"
import useGetTokenAuth from "@/hooks/useGetTokenAuth"

const useGetData = () => {
  const { getCity, getApplications } = useCityProvider()
  const city = getCity()
  const applications = getApplications()
  const { user } = useGetTokenAuth()
  
  const getData = async () => {
    if(applications) return {status: 200, data: applications}
    const email = user?.email

    if(email) {
      return api.get(`applications?email=${email}`)
    }

    return null
  }

  const getDataApplicationForm = async () => {
    const result = await getData();

    if(result?.status === 200) {
      const relevantApplication = filterApplications(result.data, city)

      if(relevantApplication) {
        return { application: relevantApplication, status: 'draft' }
      }

      const acceptedApplication = filterAcceptedApplications(result.data)
      if(acceptedApplication) {
        return { application: acceptedApplication, status: 'import' }
      }
    }

    return { application: null, status: null }
  }

  return ({
    getDataApplicationForm
  })
}
export default useGetData