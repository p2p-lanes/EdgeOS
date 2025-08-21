import { EventStatus } from "@/components/Card/EventProgressBar"

export type PopupsProps = {
  id: number;
  name: string
  tagline?: string
  location?: string
  start_date: string
  end_date: string
  image_url?: string
  status?: EventStatus,
  visible_in_portal?: boolean;
  clickable_in_portal?: boolean;
  slug?: string;
  passes_description?: string;
  allows_spouse?: boolean;
  allows_children?: boolean;
  allows_coupons?: boolean;
  ticketing_banner_description?: string;
}