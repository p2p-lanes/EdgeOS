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