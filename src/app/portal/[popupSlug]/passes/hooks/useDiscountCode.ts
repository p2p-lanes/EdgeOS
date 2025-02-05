import { api } from "@/api"
import { useCityProvider } from "@/providers/cityProvider"
import { usePassesProvider } from "@/providers/passesProvider"
import { useState } from "react"

const useDiscountCode = () => {
  const [loading, setLoading] = useState(false)
  const [discountMsg, setDiscountMsg] = useState('')
  const [validDiscount, setValidDiscount] = useState(false)
  const { getCity } = useCityProvider()
  const { setDiscount, discountApplied } = usePassesProvider()
  const city = getCity()

  const getDiscountCode = async (discountCode: string) => {
    if(!city?.id) return;

    setLoading(true)

    try{
      const res = await api.get(`coupon-codes?code=${discountCode.toUpperCase()}&popup_city_id=${city.id}`)
      if(res.status === 200){
        setDiscount({discount_value: res.data.discount_value, discount_type: 'percentage', discount_code: res.data.code})
        setDiscountMsg(res.data.message)
        setValidDiscount(true)
      }else{
        setDiscountMsg(res.data.message)
        setValidDiscount(false)
      }
    }catch(error: any){
      setDiscountMsg(error.response.data.detail)
      setValidDiscount(false)
    }finally{
      setLoading(false)
    }
  }
  
  return { getDiscountCode, loading, discountMsg, validDiscount, discountApplied }

}
export default useDiscountCode