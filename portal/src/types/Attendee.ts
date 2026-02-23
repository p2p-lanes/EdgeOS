import type { AttendeePublic } from "@edgeos/api-client"
import type { ProductsPass } from "./Products"

export type AttendeeCategory = "main" | "spouse" | "kid" | "baby" | "teen"

// Portal-specific: extends AttendeePublic with typed products for the passes UI state
export type AttendeePassState = Omit<AttendeePublic, "products"> & {
  products: ProductsPass[]
}

export interface DirectoryProduct {
  id: string
  name: string
  slug: string
  category?: string | null
  duration_type?: string | null
  start_date?: string | null
  end_date?: string | null
}

export interface AssociatedAttendee {
  name: string
  category: string
  gender?: string | null
  email?: string | null
}

export interface AttendeeDirectory {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  telegram: string | null
  role: string | null
  organization: string | null
  residence: string | null
  age: string | null
  gender: string | null
  picture_url: string | null
  brings_kids: string | boolean
  participation: DirectoryProduct[]
  check_in: string | null
  check_out: string | null
  associated_attendees: AssociatedAttendee[]
}

export interface CreateAttendee {
  name: string
  email: string
  category: AttendeeCategory
  gender: string
}
