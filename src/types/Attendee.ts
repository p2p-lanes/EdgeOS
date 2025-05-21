import { ProductsPass, ProductsProps } from "./Products";

export type AttendeeCategory = "main" | "spouse" | 'kid' | 'baby' | 'teen'

export interface AttendeeProps {
  id: number;
  name: string;
  email: string;
  check_in_code?: string;
  category: AttendeeCategory;
  application_id: number;
  gender: string;
  products: ProductsPass[]
}

export interface AttendeeDirectory {
  brings_kids: string | boolean | null;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  telegram: string | null;
  participation: string | ProductsProps[];
  role: string | null;
  organization: string | null;
}

export interface CreateAttendee {
  name: string, 
  email: string, 
  category: AttendeeCategory,
  gender: string
}
