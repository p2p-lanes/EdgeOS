
import { ProductsPass } from "@/types/Products"
import { Tag } from "lucide-react"
import { badgeName } from "../../../constants/multiuse"

const ProductCart = ({ product }: { product: ProductsPass }) => {

  return (
    <div className="flex justify-between text-sm text-muted-foreground">
      <span>1 x {product.name} ({badgeName[product.attendee_category] || product.attendee_category})</span>
      <span data-product-price={product.compare_price?.toFixed(2)}>${product.compare_price?.toFixed(2)}</span>
    </div>
  )
}
export default ProductCart