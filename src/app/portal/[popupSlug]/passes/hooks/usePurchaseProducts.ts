import { api } from "@/api"
import useGetApplications from "@/hooks/useGetApplications"
import { AttendeeProps } from "@/types/Attendee"
import { useState } from "react"
import { filterProductsToPurchase } from "../helpers/filter"
import { useApplication } from "@/providers/applicationProvider"
import { usePassesProvider } from "@/providers/passesProvider"
import { toast } from "sonner"
import { MiniKit } from "@worldcoin/minikit-js"

const usePurchaseProducts = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const { getRelevantApplication } = useApplication()
  const application = getRelevantApplication()
  const getApplication = useGetApplications(false)
  const { discountApplied, isEditing, toggleEditing } = usePassesProvider()

  const purchaseProducts = async (attendeePasses: AttendeeProps[]) => {
    if(!application) return;
    
    //Si tiene un mes seleccionado y tiene semanas o dias comprados
    const monthSelectedWithWeekOrDay = attendeePasses.some(p => p.products.some(p => p.category === 'month' && p.selected) && (p.products.some(p => p.category === 'week' && p.purchased) || p.products.some(p => p.category.includes('day') && p.purchased)))
    
    const editableMode = (isEditing || application.credit > 0 || monthSelectedWithWeekOrDay) && !attendeePasses.some(p => p.products.some(p => p.category === 'patreon' && p.selected ))
    
    setLoading(true)

    const productsPurchase = attendeePasses.flatMap(p => p.products)
    const filteredProducts = filterProductsToPurchase(productsPurchase, editableMode)

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
        const redirectUrl = isFastCheckout ? `${window.location.origin}/checkout/success` : window.location.href;
        if(response.data.status === 'pending'){
          if(MiniKit.isInstalled()){
            const checkoutUrl = response.data.checkout_url
            const url = new URL(checkoutUrl)
            window.location.href = `https://world.org/mini-app?app_id=app_f69274f93026ec73fb0ca76eb7185b73&path=${url.pathname}?redirect_url=${redirectUrl}`
          }else{
            window.location.href = `${response.data.checkout_url}?redirect_url=${redirectUrl}`
          }
        }else if(response.data.status === 'approved'){
          await getApplication()
          if(editableMode){
            toggleEditing(false)
          }
          if(isFastCheckout){
            window.location.href = redirectUrl
            return;
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