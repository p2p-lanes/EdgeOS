import { api } from "@/api"
import { useCityProvider } from "@/providers/cityProvider"
import { useEffect, useState } from "react"

const useGetData = () => {
  const [products, setProducts] = useState()
  const { getCity } = useCityProvider()
  const city = getCity()

  const getProducts = async () => {
    if(!city) return;

    const response = await api.get(`products?popup_city_id=${city.id}`)

    if(response.status === 200){
      setProducts(response.data)
    }
  }

  useEffect(() => {
    getProducts()
  }, [city])

  return ({products})
}
export default useGetData