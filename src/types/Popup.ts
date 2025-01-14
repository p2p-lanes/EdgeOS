import { EventStatus } from "@/components/Card/EventProgressBar"

export type PopupsProps = {
  id: number;
  name: string
  tagline?: string
  location?: string
  start_date: Date | string
  end_date: Date | string
  image_url?: string
  status?: EventStatus,
  visible_in_portal?: boolean;
  clickable_in_portal?: boolean;
  slug?: string;
  passes_description?: string;
}