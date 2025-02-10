import { ProductsProps } from "@/types/Products"
import { Award } from "lucide-react"
import useCalculateDiscount from "../../../../hooks/useCalculateDiscount"

const BannerDiscount = ({isPatreon, products}: {isPatreon: boolean, products: ProductsProps[]}) => {
  const { discount, label } = useCalculateDiscount(isPatreon, products)
  
  if(discount === 0) return null

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