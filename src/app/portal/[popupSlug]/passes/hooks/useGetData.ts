import { api } from "@/api"
import { useCityProvider } from "@/providers/cityProvider"
import { ProductsProps } from "@/types/Products"
import { useEffect, useState } from "react"

const useGetData = () => {
  const [products, setProducts] = useState<ProductsProps[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const { getCity, getRelevantApplication } = useCityProvider()
  const city = getCity()
  const application = getRelevantApplication()

  const getProducts = async () => {
    if(!city) return;

    const response = await api.get(`products?popup_city_id=${city.id}`)

    if(response.status === 200){
      setProducts(response.data)
    }
  }

  const getPayments = async () => {
    if(!application) return;

    const response = await api.get(`payments?application_i=${application.id}`)

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

  return ({products, payments})
}
export default useGetData