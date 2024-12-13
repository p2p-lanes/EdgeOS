import { api } from "@/api"
import { useCityProvider } from "@/providers/cityProvider"

const usePostData = () => {
  const { getRelevantApplication } = useCityProvider()
  const application = getRelevantApplication()

  const purchaseProducts = async (products: any) => {
    const hasPatreon = products.find((p: any) => (p.category === 'patreon' && p.enabled === true))
    let productsPurchase = []
    if(hasPatreon){
      productsPurchase = [hasPatreon.id]
    }else{
      productsPurchase = products.filter((product: any) => product.enabled).map((product: any) => product.id)
    }

    const response = await api.post('payments', {application_id: application.id, products: productsPurchase})
    if(response.status === 200){
      return response.data
    }

    return null;
  }

  return ({purchaseProducts})
}
export default usePostData