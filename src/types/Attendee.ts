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

export interface AttendeeDirectory {
  bring_kids: string | boolean;
  email: string;
  first_name: string;
  last_name: string;
  telegram: string;
  participation: string | ProductsProps[];
  role: string;
  organization: string;
}

export interface CreateAttendee {
  name: string, 
  email: string, 
  category: 'spouse' | 'kid' | 'main'
}
