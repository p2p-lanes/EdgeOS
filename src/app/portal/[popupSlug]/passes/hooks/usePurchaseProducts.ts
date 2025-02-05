import { api } from "@/api"
import useGetApplications from "@/hooks/useGetApplications"
import { useCityProvider } from "@/providers/cityProvider"
import { AttendeeProps } from "@/types/Attendee"
import { ProductsPass } from "@/types/Products"
import { useState } from "react"
import { filterProductsToPurchase } from "../helpers/filter"
import { useApplication } from "@/providers/applicationProvider"
import { usePassesProvider } from "@/providers/passesProvider"

const usePurchaseProducts = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const { getRelevantApplication } = useApplication()
  const application = getRelevantApplication()
  const getApplication = useGetApplications(false)
  const { discountApplied } = usePassesProvider()

  const purchaseProducts = async (attendeePasses: AttendeeProps[]) => {
    if(!application) return;
    
    setLoading(true)

    const productsPurchase = attendeePasses.flatMap(p => p.products).filter(p => p.selected)
    const filteredProducts = filterProductsToPurchase(productsPurchase)

    try{
      const data = {
        application_id: application.id,
        products: filteredProducts,
        coupon_code: discountApplied.discount_code
      }
      const response = await api.post('payments', data)
      if(response.status === 200){
        if(response.data.status === 'pending'){
          window.location.href = `${response.data.checkout_url}?redirect_url=${window.location.href}`
        }else if(response.data.status === 'approved'){
          await getApplication()
        }
        return response.data
      }
    }catch{
      console.log('error catch')
    }finally{
      setLoading(false)
    }
  }

  return ({purchaseProducts, loading})
}
export default usePurchaseProducts