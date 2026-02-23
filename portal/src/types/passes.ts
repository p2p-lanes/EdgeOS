import type { AttendeePassState } from "@/types/Attendee"
import type { ProductsPass } from "@/types/Products"

export interface PassesProps {
  purchaseProducts: () => Promise<void>
  loading: boolean
}

export interface AttendeePassesProps {
  attendee: AttendeePassState
  index: number
  toggleProduct: (attendeeId: string, product: ProductsPass) => void
}

export interface ProductsSnapshotProps {
  product_id: number
  attendee_id: number
  quantity: number
  product_name: string
  product_description: string | null
  product_price: number
  product_category: string
  created_at: string
}

export interface PaymentsProps {
  application_id: number
  external_id: string | null
  status: "approved" | "pending" | "rejected"
  amount: number
  rate: number
  source: string | null
  currency: string
  checkout_url: string | null
  products_snapshot: ProductsSnapshotProps[]
  created_at: string
  updated_at: string
  id: number
}
