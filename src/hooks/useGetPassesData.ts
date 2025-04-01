import { api } from "@/api"
import { useCityProvider } from "@/providers/cityProvider"
import { ProductsProps } from "@/types/Products"
import { useEffect, useState } from "react"

const useGetPassesData = () => {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<ProductsProps[]>([])
  const { getCity } = useCityProvider()

  const city = getCity()

  const getProducts = async () => {
    if(!city) return;

    setLoading(true)
    
    const endpoint = `products?popup_city_id=${city.id}`;

    const response = await api.get(endpoint)

    if(response.status === 200){
      setProducts(response.data)
    }

    setLoading(false)
  }

  useEffect(() => {
    getProducts()
  }, [city])

  return ({products, loading})
}
export default useGetPassesData