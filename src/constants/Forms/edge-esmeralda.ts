import { DynamicForm } from ".."

const OptionsNotShared = [
  { value: "First name", label: "First name" },
  { value: "Last name", label: "Last name" },
  { value: "Email address", label: "Email address" },
  { value: "Telegram username", label: "Telegram username" },
  { value: "Check-in date", label: "Check-in date" },
  { value: "Check-out date", label: "Check-out date" },
  { value: "Whether or not I'm bringing kids", label: "Whether or not I'm bringing kids" },
]

export const edgeEsmeralda: DynamicForm = {
  local: 'Sonoma County',
  personal_information: {
    local_resident_title: 'Are you a Sonoma resident?'
  },
  scholarship: {
    interest_text: 'We understand that some folks will need financial assistance to attend, and have other ways to contribute beyond financial support. We have limited numbers of discounted tickets to allocate. Please elaborate on why you’re applying, and what your contribution might be. We estimate roughly a 10 hour/week volunteer effort from folks who gets scholarships.',
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
    "investor",
    "video_url",
    "personal_goals",
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
  ]
}