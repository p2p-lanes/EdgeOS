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

    const isFastCheckout = window.location.href.includes('/checkout')
    
    const endpoint = isFastCheckout ? "/products/fast_checkout" : "products";
    const params = `?popup_city_id=${city.id}`;
    
    const apiOptions = isFastCheckout 
      ? {
          headers: {
            'api-key': process.env.NEXT_PUBLIC_X_API_KEY
          }
        } 
      : undefined;

    const response = await api.get(`${endpoint}${params}`, apiOptions)

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