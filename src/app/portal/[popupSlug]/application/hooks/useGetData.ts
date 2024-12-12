import { api } from "@/api"
import { useCityProvider } from "@/providers/cityProvider"
import { filterAcceptedApplication, filterApplicationDraft } from "../helpers/filters"
import useGetTokenAuth from "@/hooks/useGetTokenAuth"

const useGetData = () => {
  const { getCity, getApplications, getPopups } = useCityProvider()
  const city = getCity()
  const applications = getApplications()
  const popups = getPopups()
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

    if(!city) return { application: null, status: null }

    if(result?.status === 200) {
      const applicationDraft = filterApplicationDraft(result.data, city)

      if(applicationDraft) {
        return { application: applicationDraft, status: 'draft' }
      }

      const acceptedApplication = filterAcceptedApplication(result.data, city, popups)
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