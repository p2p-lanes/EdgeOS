import { usePassesProvider } from "@/providers/passesProvider"
import { ApplicationProps } from "@/types/Application"
import { ProductsProps } from "@/types/Products"
import { Award } from "lucide-react"
import { useMemo } from "react"

const BannerDiscount = ({isPatreon, application, products}: {isPatreon: boolean, application: ApplicationProps | null, products: ProductsProps[]}) => {
  const { discountApplied } = usePassesProvider()
  const productCompare = useMemo(() => products.find(p => p.category === 'week' && p.price !== p.compare_price) ?? {price: 100, compare_price: 100}, [products])

  
  const {discount, label} = useMemo(() => {
    if (isPatreon) return {discount: 100, label: 'As a Patron, enjoy free weekly passes for your entire family group!'}
    
    if(!application || !application.discount_assigned && !productCompare.compare_price && !discountApplied.discount_value) return {discount: 0, label: ''}
    
    if(discountApplied.discount_value){
      if(application.discount_assigned) return {discount: discountApplied.discount_value, label: `You've been awarded a special ${discountApplied.discount_value}% discount. Enjoy!`}
      return {discount: discountApplied.discount_value, label: `You've unlocked an extra ${discountApplied.discount_value}% off with your code. Enjoy!`}
    }

    const discount = 100 - ((productCompare.price ?? 0) / (productCompare.compare_price ?? 0) * 100)
    
    return {discount: Math.round(discount), label: 'early bird discount'}
  }, [isPatreon, application, productCompare, discountApplied])
  
  if(discount === 0 || !productCompare) return null

  return (
    <div className="w-full bg-gray-100 py-2 relative top-0 left-0 rounded-lg px-4">
      <div className="w-full mx-auto flex justify-center items-center gap-1">
        <Award className="w-4 h-4 stroke-[#FF7B7B] stroke-[2] bg-gradient-to-r from-[#FF7B7B] to-[#E040FB] bg-clip-text text-transparent" />
        <h2 className="text-center">
          <span className="text-sm font-bold bg-gradient-to-r from-[#FF7B7B] to-[#E040FB] bg-clip-text text-transparent">{label}</span>
        </h2>
      </div>
    </div>
  )
}
export default BannerDiscount