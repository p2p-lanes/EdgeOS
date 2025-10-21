import { useApplication } from "@/providers/applicationProvider"
import { useCityProvider } from "@/providers/cityProvider"
import { usePassesProvider } from "@/providers/passesProvider"
import { useGroupsProvider } from "@/providers/groupsProvider"
import { ProductsProps } from "@/types/Products"
import { useMemo } from "react"

const useCalculateDiscount = (isPatreon: boolean, products: ProductsProps[]) => {
  const { discountApplied } = usePassesProvider()
  const { getCity } = useCityProvider()
  const city = getCity()
  const { getRelevantApplication } = useApplication()
  const { groups } = useGroupsProvider()
  const application = getRelevantApplication()
  const productCompare = useMemo(() => products.find(p => p.category === 'week' && p.price !== p.compare_price) ?? {price: 100, compare_price: 100}, [products])

  const {discount, label, isEarlyBird} = useMemo(() => {
    if (isPatreon) return {discount: 100, label: 'As a Patron, you are directly supporting the ecosystem.'}
    
    if(!application) return {discount: 0, label: ''}

    if(application.group_id && groups.length > 0){
      const group = groups.find(g => g.id === application.group_id)
      if(group && group.discount_percentage && group.discount_percentage >= discountApplied.discount_value){
        return {discount: group.discount_percentage, label: `You've been awarded a ${group.discount_percentage}% discount from your group. Enjoy!`}
      }
    }
    
    if(discountApplied.discount_value){
      if(application.discount_assigned) return {discount: discountApplied.discount_value, label: `You've been awarded a special ${discountApplied.discount_value}% discount. Enjoy!`}
      return {discount: discountApplied.discount_value, label: `You've unlocked an extra ${discountApplied.discount_value}% off with your code. Enjoy!`}
    }
    
    if(city?.ticketing_banner_description) return {discount: 0.01, label: city.ticketing_banner_description}
    
    const discount = 100 - ((productCompare.price ?? 0) / (productCompare.compare_price ?? 0) * 100)
    
    return {discount: Math.round(discount), label: `${Math.round(discount)}% early bird discount`, isEarlyBird: true}
  }, [isPatreon, application, productCompare, discountApplied, groups])

  return {discount, label, isEarlyBird}
}
export default useCalculateDiscount