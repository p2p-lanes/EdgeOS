export interface FormDataProps {
  first_name: string;
  last_name: string;
  email: string;
  telegram: string;
  organization: string;
  role: string;
  gender: string;
  email_verified: boolean;
}

export interface GroupData {
  id: string;
  name: string;
  popup_name: string;
  popup_city_id: string;
}

export type CheckoutState = "form" | "processing" | "success" | "passes";

export interface GenderOption {
  value: string;
  label: string;
} 