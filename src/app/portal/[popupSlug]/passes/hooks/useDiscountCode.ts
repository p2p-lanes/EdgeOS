import { api } from "@/api"
import { useCityProvider } from "@/providers/cityProvider"
import { usePassesProvider } from "@/providers/passesProvider"
import { useState } from "react"
import { toast } from "sonner"

const useDiscountCode = () => {
  const [loading, setLoading] = useState(false)
  const { getCity } = useCityProvider()
  const { setDiscount } = usePassesProvider()
  const city = getCity()


  const getDiscountCode = async (discountCode: string) => {
    if(!city?.id) return

    setLoading(true)

    try{
      const res = await api.get(`discount-codes?code=${discountCode.toUpperCase()}&popup_city_id=${city.id}`)
      if(res.status === 200){
        setDiscount({discount_value: res.data.discount_value, discount_type: res.data.discount_type, discount_code: res.data.code})
        toast.success('Discount code applied')
      }else{
        toast.error(res.data.message)
      }
    }catch(error: any){
      toast.error(error.response.data.detail)
    }finally{
      setLoading(false)
    }
  }
  
  return { getDiscountCode, loading }
}
export default useDiscountCode