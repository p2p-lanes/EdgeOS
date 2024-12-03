import { api } from "@/api"
import { useCityProvider } from "@/providers/cityProvider"
import { PopupsProps } from "@/types/Popup"
import { useParams } from "next/navigation"
import { useEffect } from "react"

const useGetPopups = () => {
  const { setPopups, setCity, getPopups } = useCityProvider()
  const popups = getPopups()
  const { popupSlug } = useParams()

  const findValidCity = (cities: PopupsProps[], slug?: string) => {
    return cities.find(city => 
      city.clickable_in_portal && 
      city.visible_in_portal && 
      (slug ? city.slug === slug : true)
    )
  }

  useEffect(() => {
    if (popups?.length > 0) return

    api.get('popups').then(res => {
      if (res.status === 200) {
        const cities = res.data as PopupsProps[]
        setPopups(cities)

        const selectedCity = findValidCity(cities, popupSlug as string) || findValidCity(cities)
        if (selectedCity) setCity(selectedCity)
      }
    })
  }, [])
}

export default useGetPopups