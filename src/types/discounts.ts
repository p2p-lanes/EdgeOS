export interface DiscountProps {
  discount_value: number;
  discount_type: 'percentage';
  discount_code?: string | null;
  city_id?: number | null;
}