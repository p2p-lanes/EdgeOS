import { AttendeeCategory } from "./Attendee";

export type CategoryProducts = 'week' | 'patreon' | 'month' | 'supporter' | 'exclusive' | 'day' | 'local week' | 'local month' | 'local day' | 'housing' | 'merch'

export interface ProductsProps {
  name: string;
  price: number;
  popup_city_id: number;
  description: string | null;
  category: CategoryProducts;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
  id: number;
  attendee_category: AttendeeCategory;
  builder_price: number | null;
  compare_price: number | null;
  exclusive: boolean;
}

export interface ProductsPass extends ProductsProps {
  selected?: boolean,
  edit?: boolean,
  purchased?: boolean,
  attendee_id?: number;
  quantity?: number;
  original_price?: number;
  disabled?: boolean;
  original_quantity?: number;
}
