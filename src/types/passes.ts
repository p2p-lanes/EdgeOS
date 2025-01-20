import { ProductsPass } from "@/types/Products"
import { AttendeeProps } from "@/types/Attendee"

export interface PassesProps {
  purchaseProducts: () => Promise<void>;
  loading: boolean;
}

export interface AttendeePassesProps {
  attendee: AttendeeProps;
  index: number;
  toggleProduct: (attendeeId: number, productId: number) => void;
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
