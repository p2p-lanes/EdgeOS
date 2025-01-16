import { DynamicForm } from "..";

export const edgeAustin: DynamicForm = {
  participation: {
    title: 'Builders',
    subtitle: 'Check this box if you’re a builder or developer interested in creating open-source software at Edge City Austin. By selecting this, you are applying for a 40% discount on your participation fee. Please note that your application is subject to review and approval.'
  },
  scholarship: {
    title: 'Scholars',
    subtitle: 'Check this box if you’re a scholar interested in attending to Edge City Austin. By selecting this, you are applying for a 60% discount on your participation fee. Please note that your application is subject to review and approval.',
  },
  accommodation: {
    title: 'Accommodation',
    subtitle: 'Check this box if you have booked accommodation at Hotel Magdalena. Your ticket is included with your stay, giving you a 100% discount on the participation fee. Please ensure you provide your booking confirmation for verification. Note that your application is subject to review and approval.'
  },
  fields: [
    "first_name",
    "last_name",
    "gender",
    "age",
    "telegram",
    "residence",
    // "builder_boolean",
    // "scholarship_request",
    // "is_renter"
  ]
}