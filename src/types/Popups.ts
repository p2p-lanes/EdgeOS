import { EventStatus } from "@/components/EventProgressBar"

export type PopupsProps = {
  id: string;
  name: string
  tagline?: string
  location?: string
  start_date?: string
  end_date?: string
  image_url?: string
  status?: EventStatus 
}