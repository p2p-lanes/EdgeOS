import { validateVideoUrl } from "@/helpers/validate"
import { useEffect, useState } from "react"

const useProgress = (formData: any) => {
  const [progress, setProgress] = useState(0)
  const isVideoValid = validateVideoUrl(formData.video_url)

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
        required: !isVideoValid
      },
      {
        name: 'participation',
        fields: ['duration'],
        required: !isVideoValid
      },
      {
        name: 'builder_description',
        fields: ['builder_description'],
        required: formData.builder_boolean && !isVideoValid
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