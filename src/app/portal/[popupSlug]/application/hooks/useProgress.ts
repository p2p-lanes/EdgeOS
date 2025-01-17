import { dynamicForm } from "@/constants"
import { validateVideoUrl } from "@/helpers/validate"
import { useCityProvider } from "@/providers/cityProvider"
import { useEffect, useMemo, useState } from "react"

const useProgress = (formData: any) => {
  const [progress, setProgress] = useState(0)
  const isVideoValid = validateVideoUrl(formData.video_url)
  const { getCity } = useCityProvider()
  const city = getCity()
  const fields = useMemo(() => city?.slug ? new Set(dynamicForm[city.slug]?.fields) : null, [city])

  useEffect(() => {
    if (!fields) return

    const sections = [
      {
        name: 'personalInformation',
        fields: ['first_name', 'last_name', 'telegram', 'gender', 'age', 'email'].filter(f => fields.has(f)),
        required: true
      },
      {
        name: 'professionalDetails',
        fields: ['organization', 'social_media'].filter(f => fields.has(f)),
        required: !isVideoValid
      },
      {
        name: 'participation',
        fields: ['duration'].filter(f => fields.has(f)),
        required: !isVideoValid
      },
      {
        name: 'builder_description',
        fields: ['builder_description'].filter(f => fields.has(f)),
        required: formData.builder_boolean && !isVideoValid
      },
      {
        name: 'spouse',
        fields: ['spouse_info', 'spouse_email'].filter(f => fields.has(f)),
        required: formData.brings_spouse
      },
      {
        name: 'kids',
        fields: ['kids_info'].filter(f => fields.has(f)),
        required: formData.brings_kids
      },
      {
        name: 'scholarship',
        fields: ['scholarship_video_url'].filter(f => fields.has(f)),
        required: formData.scholarship_request
      },
      {
        name: 'accommodation',
        fields: ['booking_confirmation'].filter(f => fields.has(f)),
        required: formData.is_renter
      }
    ]

    // Solo considerar secciones que tengan campos después del filtrado
    const validSections = sections.filter(section => section.fields.length > 0)
    const totalSections = validSections.filter(section => section.required).length
    
    const filledSections = validSections.filter(section => 
      section.required && section.fields.every(field => 
        Array.isArray(formData[field]) ? formData[field].length > 0 : Boolean(formData[field])
      )
    ).length

    setProgress(totalSections > 0 ? (filledSections / totalSections) * 100 : 0)
  }, [formData, fields, isVideoValid])

  return progress
}

export default useProgress