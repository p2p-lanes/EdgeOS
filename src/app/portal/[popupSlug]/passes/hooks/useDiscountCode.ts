import { api } from "@/api"
import useCompareDiscount from "@/hooks/useCompareDiscount"
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
  const { compareDiscount } = useCompareDiscount()

  const getDiscountCode = async (discountCode: string) => {
    if(!city?.id) return;

    setLoading(true)

    try{
      const res = await api.get(`coupon-codes?code=${discountCode.toUpperCase()}&popup_city_id=${city.id}`)
      if(res.status === 200){
        const newDiscount = compareDiscount(res.data.discount_value)
        console.log('newDiscount', newDiscount)

        if(newDiscount.is_best){
          setDiscount({discount_value: newDiscount.discount_value, discount_type: 'percentage', discount_code: res.data.code, city_id: city.id})
          setDiscountMsg(res.data.message)
          setValidDiscount(true)
          return;
        }
        setDiscountMsg('You already have a higher discount than this coupon. Please, try another one.')
        setValidDiscount(false)
        return;
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

  const clearDiscountMessage = () => {
    setDiscountMsg('')
  }
  
  return { 
    getDiscountCode, 
    loading, 
    discountMsg, 
    validDiscount, 
    discountApplied,
    clearDiscountMessage 
  }
}

export default useDiscountCode