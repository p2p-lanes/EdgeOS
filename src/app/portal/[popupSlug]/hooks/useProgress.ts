import { useEffect, useState } from "react"

const useProgress = (formData: any) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Calculate progress based on filled sections
    const sections = [
      {
        name: 'personalInformation',
        fields: ['first_name', 'last_name', 'telegram', 'gender', 'age'],
        required: true
      },
      {
        name: 'professionalDetails',
        fields: ['organization', 'social_media'],
        required: true
      },
      {
        name: 'participation',
        fields: ['duration', 'check_in', 'check_out', 'success_definition', 'top_tracks', 'host_session'],
        required: true
      },
      {
        name: 'builder_description',
        fields: ['builder_description'],
        required: formData.builder_boolean
      },
      {
        name: 'spouse',
        fields: ['spouse_info', 'spouse_email'],
        required: formData.brings_spouse
      },
      {
        name: 'kids',
        fields: ['kids_info'],
        required: formData.brings_kids
      },
      {
        name: 'scolarship_request',
        fields: ['scolarship_categories', 'scolarship_details'],
        required: formData.scolarship_request
      }
    ]

    const totalSections = sections.filter(section => section.required).length
    const filledSections = sections.filter(section => 
      section.required && section.fields.every(field => 
        Array.isArray(formData[field]) ? formData[field].length > 0 : Boolean(formData[field])
      )
    ).length

    setProgress((filledSections / totalSections) * 100)
  }, [formData])

  return progress
}
export default useProgress