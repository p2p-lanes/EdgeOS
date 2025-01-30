import { usePassesProvider } from "@/providers/passesProvider"
import { ApplicationProps } from "@/types/Application"
import { ProductsProps } from "@/types/Products"
import { useMemo } from "react"


const BannerDiscount = ({isPatreon, application, products}: {isPatreon: boolean, application: ApplicationProps | null, products: ProductsProps[]}) => {
  const { discountApplied } = usePassesProvider()
  const productCompare = useMemo(() => products.find(p => p.category === 'week' && p.price !== p.compare_price) ?? {price: 100, compare_price: 100}, [products])

  const {discount, label} = useMemo(() => {
    if (isPatreon) return {discount: 100, label: 'discount applied'}
    
    if(!application || !application.discount_assigned && !productCompare.compare_price && !discountApplied.discount_value) return {discount: 0, label: ''}
    
    const maxDiscount = Math.max(application.discount_assigned || 0, discountApplied.discount_value || 0)
    
    if(maxDiscount) return {discount: maxDiscount, label: 'discount applied'}
    
    const discount = 100 - ((productCompare.price ?? 0) / (productCompare.compare_price ?? 0) * 100)

    return {discount: Math.round(discount), label: 'early bird discount'}
  }, [isPatreon, application, productCompare, discountApplied])
  
  if(discount === 0 || !productCompare) return null

  return (
    <div className="w-full bg-gradient-to-r from-[#FF7B7B] to-[#E040FB] py-1 relative top-0 left-0">
      <div className="w-full mx-auto flex justify-center items-center">
        <h2 className="text-white text-center">
          <span className="text-sm font-bold">{discount}% {label}</span>
        </h2>
      </div>
    </div>
  )
}
export default BannerDiscount