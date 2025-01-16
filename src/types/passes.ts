import { ProductsPass } from "@/types/Products"
import { AttendeeProps } from "@/types/Attendee"

export interface PassesProps {
  products: ProductsPass[];
  attendees: AttendeeProps[];
  onToggleProduct: (attendee: AttendeeProps | undefined, product?: ProductsPass) => void;
  purchaseProducts: () => Promise<void>;
  loadingProduct: boolean;
}

export interface AttendeePassesProps {
  attendee: AttendeeProps;
  index: number;
  products: ProductsPass[];
  onToggleProduct: (attendee: AttendeeProps | undefined, product?: ProductsPass) => void;
} 

export interface PaymentsProps {
  application_id: number;
  external_id: string | null;
  status: 'approved' | 'pending' | 'rejected';
  amount: number;
  source: string | null;
  currency: string;
  checkout_url: string | null;
  created_at: string;
  updated_at: string;
  id: number;
}
