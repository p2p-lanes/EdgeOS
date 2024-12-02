import { api } from "@/api"
import { useCityProvider } from "@/providers/cityProvider"
import { PopupsProps } from "@/types/Popups"
import { useEffect, useState } from "react"

const useGetPopups = () => {
  const { setPopups, setCity, getPopups } = useCityProvider()
  const popups = getPopups()

  useEffect(() => {

    if(popups?.length > 0) return;

    api.get('popups').then((res) => {
      if(res.status === 200) {
        const data = res.data as PopupsProps[]
        setPopups(data)

        const city = data.find((city) => city.clickable_in_portal && city.visible_in_portal);

        setCity(city)
      }
    })

  }, [])

}
export default useGetPopups