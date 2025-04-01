import { api } from "@/api"
import useGetApplications from "@/hooks/useGetApplications"
import { AttendeeProps } from "@/types/Attendee"
import { useState } from "react"
import { filterProductsToPurchase } from "../helpers/filter"
import { useApplication } from "@/providers/applicationProvider"
import { usePassesProvider } from "@/providers/passesProvider"
import { toast } from "sonner"

const usePurchaseProducts = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const { getRelevantApplication } = useApplication()
  const application = getRelevantApplication()
  const getApplication = useGetApplications(false)
  const { discountApplied, isEditing, toggleEditing } = usePassesProvider()

  const purchaseProducts = async (attendeePasses: AttendeeProps[]) => {
    if(!application) return;

    const editableMode = (isEditing || application.credit >= 0) && !attendeePasses.some(p => p.products.some(p => p.category === 'patreon' && p.selected ))
    
    setLoading(true)

    const productsPurchase = attendeePasses.flatMap(p => p.products).filter(p => 
      editableMode 
        ? (!p.edit && ((!p.selected && p.purchased) || (p.selected && !p.purchased)))
        : p.selected
    )

    const filteredProducts = filterProductsToPurchase(productsPurchase)

    try{
      const isFastCheckout = window.location.href.includes('/checkout')

      const data = {
        application_id: application.id,
        products: filteredProducts,
        coupon_code: discountApplied.discount_code,
        edit_passes: editableMode
      }
      
      const response = await api.post('payments', data)

      if(response.status === 200){
        if(response.data.status === 'pending'){
          const redirectUrl = isFastCheckout ? `${window.location.origin}/checkout/success` : window.location.href;
          window.location.href = `${response.data.checkout_url}?redirect_url=${redirectUrl}`
        }else if(response.data.status === 'approved'){
          await getApplication()
          if(editableMode){
            toggleEditing(false)
          }
          toast.success('Success! Your pass has been successfully updated. No additional payment was required.')
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