import { DynamicForm } from "..";

export const edgeAustin: DynamicForm = {
  professional_details: {
    title: 'Public profile',
    subtitle: 'Share links to your public profiles so we can learn more about you and connect with your work and interests.'
  },
  participation: {
    title: 'Builders',
    subtitle: 'Check this box if you’re a builder or developer interested in creating open-source software at Edge City Austin. By selecting this, you are applying for a 40% discount on your participation fee. Please note that your application is subject to review and approval.'
  },
  scholarship: {
    title: 'Edge City Austin scholarship',
    subtitle: 'Fill out this section if you are interested in securing one of a limited number of scholarships for Edge City Austin. Kindly note that your application will be subject to review and approval.',
    scholarship_details: "Tell us about your motivation for joining Edge City Austin. Share details about a project you’re currently working on or one that you’re passionate about. Feel free to include anything else you'd like us to know!"
  },
  accommodation: {
    title: 'Accommodation',
    subtitle: 'Your ticket is included with your stay (a minimum of 4 nights from March 2nd to March 7th), granting you a 100% discount on the participation fee. Please provide your booking confirmation for verification. Kindly note that your application will be subject to review and approval.'
  },
  fields: [
    "first_name",
    "last_name",
    "gender",
    "age",
    "telegram",
    "residence",
    "builder_boolean",
    "scholarship_request",
    "scholarship_details",
    "is_renter",
    "github_profile",
    "social_media"
  ]
}