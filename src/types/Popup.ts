import { EventStatus } from "@/components/Card/EventProgressBar"

export type PopupsProps = {
  id: string;
  name: string
  tagline?: string
  location?: string
  start_date?: Date
  end_date?: Date
  image_url?: string
  status?: EventStatus,
  visible_in_portal?: boolean;
  clickable_in_portal?: boolean;
  slug?: string;
}