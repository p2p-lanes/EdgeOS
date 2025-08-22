import { dynamicForm } from "@/constants"
import { validateVideoUrl } from "@/helpers/validate"
import { useCityProvider } from "@/providers/cityProvider"
import { useEffect, useMemo, useState } from "react"
import useGetFields from "./useGetFields"

type FieldValue = string | boolean | string[] | string[][] | null
type FormData = Record<string, FieldValue>

const useProgress = (formData: FormData) => {
  const [progress, setProgress] = useState(0)
  const { getCity } = useCityProvider()
  const city = getCity()
  const { fields } = useGetFields()
  const isVideoValid = validateVideoUrl(formData.video_url, fields)

  useEffect(() => {
    if (!fields) return

    const sections = [
      {
        name: 'personalInformation',
        fields: ['first_name', 'last_name', 'telegram', 'gender', 'age', 'email', 'local_resident'].filter(f => fields.has(f)),
        required: true
      },
      // {
      //   name: 'personalInformation',
      //   fields: ['first_name', 'last_name', 'telegram', 'gender', 'age', 'email', 'local_resident'].filter(f => fields.has(f)),
      //   required: formData.local_resident !== null
      // },
      {
        name: 'personalInformation',
        fields: ['gender_specify'].filter(f => fields.has(f)),
        required: formData.gender === 'Specify'
      },
      {
        name: 'professionalDetails',
        fields: ['organization'].filter(f => fields.has(f)),
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
        name: 'scholarship',
        fields: ['scholarship_details'].filter(f => fields.has(f)),
        required: formData.scholarship_request && city?.slug === 'edge-austin'
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
    
    const isFieldValueFilled = (field: string) => {
      const value = formData[field]
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'boolean') return true // treat both true and false as filled
      return Boolean(value)
    }

    const filledSections = validSections.filter(section => 
      section.required && section.fields.every(field => isFieldValueFilled(field))
    ).length

    setProgress(totalSections > 0 ? (filledSections / totalSections) * 100 : 0)
  }, [formData, fields, isVideoValid, city?.slug])

  return progress
}

export default useProgress