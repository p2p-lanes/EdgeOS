import type { ProductPublic } from "@edgeos/api-client"

/**
 * Portal-specific extension of ProductPublic.
 * - price: overridden to number (API returns string for Decimal precision; portal converts)
 * - compare_price: same treatment
 * - category: string (portal uses more specific categories than API spec)
 */
export type ProductsPass = Omit<
  ProductPublic,
  "price" | "compare_price" | "category"
> & {
  price: number
  compare_price?: number | null
  category: string
  selected?: boolean
  edit?: boolean
  purchased?: boolean
  attendee_id?: string
  quantity?: number
  original_price?: number
  disabled?: boolean
  original_quantity?: number
}
