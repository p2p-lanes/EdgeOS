import { AttendeeProps } from "./Attendee";
import { AgeRangeProps, GenderProps } from "./User";

type DurationProps = "1 weekend" | "1 week" | "2 weeks" | "full length" | "all weekends"

type ApplicationStatusProps = "draft" | "in review" | "accepted" | "rejected"

export type TicketCategoryProps = "standard" | "discounted"

export interface ApplicationProps {
  attendees: AttendeeProps[];
  first_name?: string;
  last_name?: string;
  telegram?: string;
  organization?: string;
  role?: string | null;
  gender?: GenderProps;
  age?: AgeRangeProps;
  social_media?: string;
  residence?: string | null;
  eth_address?: string | null;
  duration?: DurationProps;
  check_in?: string; // ISO Date format
  check_out?: string; // ISO Date format
  builder_boolean?: boolean;
  builder_description?: string;
  hackathon_interest?: string | null;
  gitcoin_oss?: string | null;
  draft_and_demos?: string | null;
  host_session?: string;
  personal_goals?: string | null;
  referral?: string | null;
  info_to_share?: string | null;
  investor?: string | null;
  success_definition?: string[];
  top_tracks?: string[];
  brings_spouse?: boolean;
  spouse_info?: string;
  spouse_email?: string;
  brings_kids?: boolean;
  kids_info?: string;
  scholarship_request?: boolean;
  scholarship_details?: string;
  status?: ApplicationStatusProps;
  citizen_id?: number;
  popup_city_id?: number;
  email?: string;
  id: number;
  local_resident?: boolean;
  citizen?: string | null;
  updated_at?: string;
  ticket_category?: TicketCategoryProps;
  discount_assigned?: number;
  submitted_at?: string;
  credit: number
}