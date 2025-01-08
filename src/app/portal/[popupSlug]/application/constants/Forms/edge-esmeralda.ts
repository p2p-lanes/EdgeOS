const OptionsNotShared = [
  { value: "First name", label: "First name" },
  { value: "Last name", label: "Last name" },
  { value: "Email address", label: "Email address" },
  { value: "Telegram username", label: "Telegram username" },
  { value: "Check-in date", label: "Check-in date" },
  { value: "Check-out date", label: "Check-out date" },
  { value: "Whether or not I'm bringing kids", label: "Whether or not I'm bringing kids" },
]

export type DynamicForm = {
  fields: string[]
}

export const edgeEsmeralda: DynamicForm = {
  fields: [
    "first_name",
    "last_name",
    "gender",
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
    "hackathon_interest",
    "investor",
    "video_url",
    "personal_goals",
    "host_session",
    "brings_spouse",
  ]
}