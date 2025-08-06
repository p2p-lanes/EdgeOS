
import { ProductsPass } from "@/types/Products"
import { badgeName } from "../../../constants/multiuse"

const ProductCart = ({ product }: { product: ProductsPass }) => {

  const price =  product.original_price ? product.original_price : product.price

  return (
    <div className="flex justify-between text-sm text-muted-foreground">
      <span>1 x {product.name} ({badgeName[product.attendee_category] || product.attendee_category})</span>
      <span data-product-price={price.toFixed(0)}>{product.edit ? `- $${price.toFixed(0)}` : `$${price.toFixed(0)}`}</span>
    </div>
  )
}
export default ProductCart