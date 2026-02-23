import type { ProductsPass } from "@/types/Products"
import { badgeName } from "../../../constants/multiuse"

const ProductCart = ({ product }: { product: ProductsPass }) => {
  const price = product.original_price ? product.original_price : product.price

  const quantity = product.category.includes("day")
    ? (product.quantity ?? 0) - (product.original_quantity ?? 0)
    : 1

  const totalPrice = (price * quantity).toFixed(0)

  return (
    <div className="flex justify-between text-sm text-muted-foreground">
      <span>
        {quantity} x {product.name} (
        {(badgeName as Record<string, string>)[
          product.attendee_category ?? ""
        ] || product.attendee_category}
        )
      </span>
      <span data-product-price={totalPrice}>
        {product.edit ? `- $${totalPrice}` : `$${totalPrice}`}
      </span>
    </div>
  )
}
export default ProductCart
