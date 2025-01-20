import { api } from "@/api"
import useGetApplications from "@/hooks/useGetApplications"
import { useCityProvider } from "@/providers/cityProvider"
import { ProductsPass } from "@/types/Products"
import { useState } from "react"

const usePostData = () => {
  const [loadingProduct, setLoadingProduct] = useState<boolean>(false)
  const { getRelevantApplication } = useCityProvider()
  const application = getRelevantApplication()
  const getApplication = useGetApplications(false)

  const purchaseProducts = async (products: ProductsPass[]) => {
    if(!application) return;
    setLoadingProduct(true)
    const productsPurchase = products.filter(p => p.selected)
    const filteredProducts = productsPurchase.reduce((acc: ProductsPass[], product) => {
      if (product.category === 'month' || product.category === 'patreon') {
        return [...acc, product];
      }
      const hasMonthProduct = productsPurchase.some(p => 
        p.category === 'month' && 
        p.attendee_category === product.attendee_category
      );
      
      if (!hasMonthProduct) {
        return [...acc, product];
      }
      return acc;
    }, []).map(p => ({product_id: p.id, attendee_id: p.attendee_id, quantity: 1}))
    try{
      const response = await api.post('payments', {application_id: application.id, products: filteredProducts})
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
      setLoadingProduct(false)
    }
  }

  return ({purchaseProducts, loadingProduct})
}
export default usePostData