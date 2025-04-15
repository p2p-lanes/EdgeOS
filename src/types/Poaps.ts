export interface PoapProps {
  id?: string;
  _id?: string;
  attendee_id: number;
  attendee_name: string;
  attendee_email: string;
  poap_url: string;
  poap_name: string;
  poap_description: string;
  poap_image_url: string;
  poap_claimed: boolean;
  poap_is_active: boolean;
  attendee_category: string;
}

export interface PoapResponse {
  poaps: PoapProps[];
  popup_id: string;
  popup_name: string;
}

