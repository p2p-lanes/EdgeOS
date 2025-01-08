import { useCityProvider } from "@/providers/cityProvider"
import { ApplicationProps } from "@/types/Application"
import { useMemo } from "react"

const BannerDiscount = ({isPatreon, application}: {isPatreon: boolean, application: ApplicationProps}) => {
  const { getProducts } = useCityProvider()
  const productCompare = useMemo(() => getProducts()?.[0] || {price: 85, compare_price: 100}, [getProducts])

  const {discount, label} = useMemo(() => {
    if (isPatreon) return {discount: 100, label: 'discount applied'}

    if(application.ticket_category === 'discounted' && application.discount_assigned ){
      return {discount: application.discount_assigned, label: 'discount applied'}
    }

    if(application.ticket_category === 'standard'){
      const discount = 100 - ((productCompare.price ?? 0) / (productCompare.compare_price ?? 0) * 100)
      return {discount: discount.toFixed(0), label: 'early bird discount'}
    }

    return {discount: 0, label: ''}
  }, [isPatreon, application, productCompare])

  if(discount === 0) return null

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