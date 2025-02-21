import { useApplication } from "@/providers/applicationProvider"
import { usePassesProvider } from "@/providers/passesProvider"
import { ProductsProps } from "@/types/Products"
import { useMemo } from "react"

const useCalculateDiscount = (isPatreon: boolean, products: ProductsProps[]) => {
  const { discountApplied } = usePassesProvider()
  const { getRelevantApplication } = useApplication()
  const application = getRelevantApplication()
  const productCompare = useMemo(() => products.find(p => p.category === 'week' && p.price !== p.compare_price) ?? {price: 100, compare_price: 100}, [products])

  const {discount, label, isEarlyBird} = useMemo(() => {
    if (isPatreon) return {discount: 100, label: 'As a Patron, you are directly supporting the ecosystem.'}
    
    if(!application || !application.discount_assigned && !productCompare.compare_price && !discountApplied.discount_value) return {discount: 0, label: ''}
    
    if(discountApplied.discount_value){
      if(application.discount_assigned) return {discount: discountApplied.discount_value, label: `You've been awarded a special ${discountApplied.discount_value}% discount. Enjoy!`}
      return {discount: discountApplied.discount_value, label: `You've unlocked an extra ${discountApplied.discount_value}% off with your code. Enjoy!`}
    }

    const discount = 100 - ((productCompare.price ?? 0) / (productCompare.compare_price ?? 0) * 100)
    
    return {discount: Math.round(discount), label: `${Math.round(discount)}% early bird discount`, isEarlyBird: true}
  }, [isPatreon, application, productCompare, discountApplied])

  return {discount, label, isEarlyBird}
}
export default useCalculateDiscount