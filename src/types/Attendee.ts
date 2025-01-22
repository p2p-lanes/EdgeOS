import { ProductsPass, ProductsProps } from "./Products";

export type AttendeeCategory = "main" | "spouse" | 'kid'

export interface AttendeeProps {
  id: number;
  name: string;
  email: string;
  category: AttendeeCategory;
  application_id: number;
  products: ProductsPass[]
}

export interface CreateAttendee {
  name: string, 
  email: string, 
  category: 'spouse' | 'kid' | 'main'
}
