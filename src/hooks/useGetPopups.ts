import { api } from "@/api"
import { useCityProvider } from "@/providers/cityProvider"
import { PopupsProps } from "@/types/Popup"
import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import useAuthentication from "./useAuthentication"

type UseGetPopups = {
  getPopupsApi: () => Promise<void>
}

const useGetPopups = (): UseGetPopups => {
  const { setPopups } = useCityProvider()
  const { logout } = useAuthentication()
  const router = useRouter()
  const { popupSlug } = useParams()

  const findValidCity = (cities: PopupsProps[], slug?: string) => {
    return cities.find(city => 
      city.clickable_in_portal && 
      city.visible_in_portal && 
      (slug ? city.slug === slug : true)
    )
  }

  const getPopupsApi = async () => {
    try{
      const response = await api.get('popups')
      if (response.status === 200) {
        const cities = response.data as PopupsProps[]
        setPopups(cities.reverse())

        if(!popupSlug || !findValidCity(cities, popupSlug as string)){
          const selectedCity = findValidCity(cities)
          if (selectedCity) router.push(`/portal/${selectedCity.slug}`)
        }
      }
    } catch(err: any) {
      if(err.response?.status === 401) {
        logout()
      }
    }
  }

  useEffect(() => {
    getPopupsApi()
  }, [])

  return {
    getPopupsApi
  }
}

export default useGetPopups