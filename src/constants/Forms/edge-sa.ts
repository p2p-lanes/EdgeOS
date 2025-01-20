import { DynamicForm } from "..";

export const paymentCapacityOptions = [
  { value: '500 USD', label: '500 USD' },
  { value: '1000 USD', label: '1000 USD' },
  { value: '1500 USD', label: '1500 USD' },
  { value: '2000 USD', label: '2000 USD' },
  { value: '2500 USD', label: '2500 USD' },
]

export const edgeSa: DynamicForm = {
  local: 'South Africa',
  scholarship: {
    title: 'Edge South Africa financial support',
    subtitle: 'We always want to make our trips inclusive and not cost prohibitive, so if you need sponsorship support, let us know :) As a reminder we\'re a 501c3 and all ticket costs go toward covering our expenses for events for the long term.',
    scholarship_request: 'Are you interested in applying for financial support?'
  },
  fields: [
    "first_name",
    "last_name",
    "gender",
    "age",
    "telegram",
    "residence",
    "eth_address",
    "local_resident",
    "organization",
    "role",
    "social_media",
    "personal_goals",
    "brings_spouse",
    "brings_kids",
    "kids_info",
    "payment_capacity",
    "scholarship_request",
    "payment_capacity",
  ]
}