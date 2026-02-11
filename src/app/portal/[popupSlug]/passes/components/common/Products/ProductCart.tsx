import { ProductsPass } from "@/types/Products"
import { badgeName } from "../../../../../../../components/utils/multiuse"
import { isVariablePrice, getEffectivePrice } from "@/helpers/variablePrice"

const ProductCart = ({ product }: { product: ProductsPass }) => {
  // For variable price products, use custom_amount; otherwise use original_price or price
  const price = isVariablePrice(product) 
    ? getEffectivePrice(product) 
    : (product.original_price ?? product.price)
  
  const quantity = product.category.includes('day') ? (product.quantity ?? 0) - (product.original_quantity ?? 0) : 1

  const totalPrice = (price * quantity).toFixed(0)

  return (
    <div className="flex justify-between text-sm text-muted-foreground">
      <span>{quantity} x {product.name} ({badgeName[product.attendee_category] || product.attendee_category})</span>
      <span data-product-price={totalPrice}>{product.edit ? `- $${totalPrice}` : `$${totalPrice}`}</span>
    </div>
  )
}
export default ProductCart