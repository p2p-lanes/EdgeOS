import { api } from "@/api"
import { getUser } from "../helpers/getData"
import { useCityProvider } from "@/providers/cityProvider"
import { filterApplications } from "../helpers/filters"

const useGetData = () => {
  const { getCity } = useCityProvider()
  const city = getCity()

  const getData = async () => {
    const email = getUser()
    if(email) {
      return api.get(`applications?email=${email}`)
    }

    return null
  }

  const getDataDraft = async () => {
    const result = await getData();

    if(result?.status === 200) {
      const relevantApplication = filterApplications(result.data, city)
      if(relevantApplication && (relevantApplication.status === 'draft' || relevantApplication.status === 'in review')) {
        return relevantApplication
      }
    }

    return null
  }

  const getDataExisting = async () => {
    const result = await getData();

    if(result?.status === 200) {
      const relevantApplication = filterApplications(result.data, city)
      if(relevantApplication && relevantApplication.status === 'accepted') {
        return relevantApplication
      }
    }

    return null
  }

  return ({
    getDataDraft,
    getDataExisting
  })
}
export default useGetData