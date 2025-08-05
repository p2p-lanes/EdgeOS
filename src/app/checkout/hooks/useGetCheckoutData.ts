"use client";

import { instance } from "@/api"
import { useCityProvider } from "@/providers/cityProvider";
import { usePassesProvider } from "@/providers/passesProvider";
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"



const useGetCheckoutData = () => {
  const searchParams = useSearchParams()
  const groupParam = searchParams.get("group")
  const [group, setGroup] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { setCityPreselected } = useCityProvider()
  const { setDiscount } = usePassesProvider()

  const getGroup = async () => {
    setIsLoading(true)
    try{
      const response = await instance.get(`/groups/aux/${groupParam}`, {
        headers: {
          'api-key': process.env.NEXT_PUBLIC_X_API_KEY
        }
      })
      setGroup(response.data)
      setCityPreselected(response.data.popup_city_id)
      setDiscount({discount_value: response.data.discount_percentage, discount_type: 'percentage'})
      setIsLoading(false)
    } catch (error: any) {
      setError(`Error fetching group data: ${error.response.data.detail}`)
      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getGroup()
  }, [groupParam])

  return { data: { group }, error, isLoading }
}
export default useGetCheckoutData