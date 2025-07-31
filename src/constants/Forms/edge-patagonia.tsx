import { DynamicForm } from ".."

export const edgePatagonia: DynamicForm = {
  local: 'Sonoma County',
  scholarship: {
    interest_text: 'We have a limited number of scholarships available, offering a 30% discount on tickets.',
    scholarship_video_url: {
      label: <p className="text-sm flex flex-col gap-1">
        [Mandatory] Share a ~60 second video explaining:
        <span>1. Why you’re applying for a scholarship</span>
        <span>2. In which way you will contribute to the event.</span>
      </p>
    },
    scholarship_details: 'Is there anything else you want to tell us regarding your scholarship application? (The video submission is mandatory, even if you fill out this field).'
  },
  fields: [
    "first_name",
    "last_name",
    "gender",
    "gender_specify",
    "age",
    "telegram",
    "residence",
    "eth_address",
    "referral",
    "local_resident",
    "info_not_shared",
    "organization",
    "role",
    "social_media",
    "duration",
    "builder_boolean",
    "builder_description",
    "hackathon_interest",
    "investor",
    "video_url",
    "personal_goals",
    "host_session",
    "brings_spouse",
    "brings_kids",
    "spouse_info",
    "spouse_email",
    "kids_info",
    "scholarship_interest",
    "scholarship_info",
    "scholarship_details",
    "scholarship_video_url",
    "scholarship_request",
    'patagonia_residencies',
    'scholarship_volunteer'
  ]
}