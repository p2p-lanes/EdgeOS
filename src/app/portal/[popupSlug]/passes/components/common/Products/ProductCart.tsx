
import { ProductsPass } from "@/types/Products"
import { badgeName } from "../../../constants/multiuse"

const ProductCart = ({ product }: { product: ProductsPass }) => {

  const price = product.compare_price ? product.compare_price : product.price

  return (
    <div className="flex justify-between text-sm text-muted-foreground">
      <span>1 x {product.name} ({badgeName[product.attendee_category] || product.attendee_category})</span>
      <span data-product-price={price.toFixed(2)}>${price.toFixed(2)}</span>
    </div>
  )
}
export default ProductCart