export interface CitizenProfilePopup {
  popup_name: string;
  start_date: string; // ISO string
  end_date: string;   // ISO string
  total_days: number;
  location?: string;
  image_url?: string;
}

export interface CitizenProfile {
  primary_email: string;
  secondary_email: string;
  organization: string;
  email_validated: boolean;
  first_name: string;
  last_name: string;
  x_user: string;
  telegram: string;
  gender: string;
  role: string;
  created_at: string; // ISO string
  updated_at: string; // ISO string
  id: number;
  popups: CitizenProfilePopup[];
  total_days: number;
  referral_count: number;
  picture_url: string;
  linked_emails?: string[];
  edge_mapped_sent?: boolean;
}


