export interface FormDataProps {
  first_name: string
  last_name: string
  email: string
  telegram: string
  organization: string | null
  role: string | null
  gender: string
  email_verified: boolean
  local_resident: string
}

export interface GroupData {
  id: string
  name: string
  popup_name: string
  popup_city_id: string
  description: string
  popup_city_name: string
  discount_percentage: number
  is_ambassador_group: boolean
  welcome_message: string
  popup_slug: string
}

export type CheckoutState = "form" | "processing" | "success" | "passes"

export interface GenderOption {
  value: string
  label: string
}
