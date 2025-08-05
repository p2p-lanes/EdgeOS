export interface DiscountProps {
  discount_value: number;
  discount_type: 'percentage' | 'fixed';
  discount_code?: string | null;
  city_id?: number | null;
}