import { Award } from "lucide-react"
import type { ProductsPass } from "@/types/Products"
import useCalculateDiscount from "../../hooks/useCalculateDiscount"

const BannerDiscount = ({
  isPatreon,
  products,
}: {
  isPatreon: boolean
  products: ProductsPass[]
}) => {
  const { discount, label } = useCalculateDiscount(isPatreon, products)

  if (discount === 0) return null

  return (
    <div className="w-full bg-transparent border-2 border-transparent bg-gradient-to-r from-[#FF7B7B] to-[#E040FB] rounded-md">
      <div className="w-full bg-[#EDE9FE] rounded-md py-1 px-4">
        <div className="w-full mx-auto flex justify-center items-center gap-1">
          <Award className="w-4 h-4 stroke-[#FF7B7B] stroke-[2] bg-gradient-to-r from-[#FF7B7B] to-[#E040FB] bg-clip-text text-transparent" />
          <h2 className="text-center">
            <span className="text-sm font-bold bg-gradient-to-r from-[#FF7B7B] to-[#E040FB] bg-clip-text text-transparent">
              {label}
            </span>
          </h2>
        </div>
      </div>
    </div>
  )
}
export default BannerDiscount
