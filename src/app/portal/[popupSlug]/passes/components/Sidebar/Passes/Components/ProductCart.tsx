
import { ProductsPass } from "@/types/Products"
import { badgeName } from "../../../../constants/multiuse"
import { Tag } from "lucide-react"

const ProductCart = ({ product, calculateDiscount }: { product: ProductsPass, calculateDiscount: (product: ProductsPass) => number }) => {

  if(product.category === 'month') {
    const calculateDiscountMonth = calculateDiscount(product)

    if(calculateDiscountMonth > 0) {
      return(
        <div className="flex justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-2"><Tag className="w-4 h-4" />Discount on Full {product.name}</span>
          <span> - ${calculateDiscountMonth.toFixed(2)}</span>
        </div>
      )
    }
  }

  return (
    <div className="flex justify-between text-sm text-muted-foreground">
      <span>1 x {product.name} ({badgeName[product.attendee_category] || product.attendee_category})</span>
      <span>${product.original_price?.toFixed(2)}</span>
    </div>
  )
}
export default ProductCart