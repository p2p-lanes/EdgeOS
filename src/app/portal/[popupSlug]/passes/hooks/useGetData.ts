import { api } from "@/api"
import { useCityProvider } from "@/providers/cityProvider"
import { ProductsProps } from "@/types/Products"
import { useEffect, useState } from "react"

const useGetData = () => {
  const [loading, setLoading] = useState(false)
  const [payments, setPayments] = useState<any[]>([])
  const [products, setProducts] = useState<ProductsProps[]>([])
  const { getCity, getRelevantApplication } = useCityProvider()
  
  const application = getRelevantApplication()
  const city = getCity()

  const getProducts = async () => {
    if(!city) return;

    setLoading(true)

    const response = await api.get(`products?popup_city_id=${city.id}`)

    if(response.status === 200){
      setProducts(response.data)
    }

    setLoading(false)
  }

  const getPayments = async () => {
    if(!application) return;

    const response = await api.get(`payments?application_id=${application.id}`)

    if(response.status === 200){
      setPayments(response.data)
    }
  }

  useEffect(() => {
    getPayments()
  }, [application])

  useEffect(() => {
    getProducts()
  }, [city])

  return ({payments, products, loading})
}
export default useGetData