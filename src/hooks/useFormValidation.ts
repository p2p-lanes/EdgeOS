import useGetFields from '@/app/portal/[popupSlug]/application/hooks/useGetFields'
import { dynamicForm } from '@/constants'
import { validateVideoUrl } from '@/helpers/validate'
import { useCityProvider } from '@/providers/cityProvider'
import { useState, useCallback, useMemo } from 'react'

type FieldName = string
type FieldValue = string | boolean | string[] | string[][] | null
type FormData = Record<FieldName, FieldValue>

const requiredFields = {
  personalInformation: ['first_name', 'last_name', 'telegram', 'gender', 'age', 'email', 'gender_specify'],
  professionalDetails: ['organization', 'social_media'],
  participation: ['duration', 'builder_description'],
  childrenPlusOnes: ['spouse_info', 'spouse_email', 'kids_info'],
  scholarship: ['scholarship_video_url', 'scholarship_details'],
  accommodation: ['booking_confirmation'],
}

export const useFormValidation = (initialData: FormData) => {
  const [formData, setFormData] = useState<FormData>(initialData)
  const [errors, setErrors] = useState<Record<FieldName, string>>({})
  const { getCity } = useCityProvider()
  const city = getCity()
  const { fields } = useGetFields()


  const validateField = useCallback((name: FieldName, value: FieldValue, formData: FormData) => {
    if (!fields?.has(name)) return ''

    const validateVideo = validateVideoUrl(formData.video_url)
    
    if (formData.video_url && validateVideo) {
      const requiredWithVideo = [
        ...requiredFields.personalInformation,
        ...requiredFields.childrenPlusOnes,
        ...requiredFields.scholarship
      ].filter(field => fields.has(field))
      
      if (!requiredWithVideo.includes(name)) return ''
    }

    const isRequired = Object.values(requiredFields).flat().includes(name)

    if (isRequired) {
      if(name === 'booking_confirmation') {
        if(!formData.is_renter) return '';
      }
      if(name === 'social_media') {
        if(fields.has('video_url') && validateVideo) return '';
      }
      if(name === 'gender_specify') {
        if(formData.gender !== 'Specify') return '';
      }
      if (name === 'spouse_info' || name === 'spouse_email') {
        if (!formData.brings_spouse) return '';
      }
      if (name === 'kids_info') {
        if (!formData.brings_kids) return '';
      }
      if (name === 'builder_description') {
        if (!formData.builder_boolean || validateVideoUrl(formData.video_url)) return '';
      }
      if(name === 'scholarship_video_url') {
        if (!formData.scholarship_request || validateVideoUrl(formData.scholarship_video_url)) return '';
      }
      if(name === 'scholarship_details') {
        if(!formData.scholarship_request || city?.slug !== 'edge-austin') return '';
      }

      if (Array.isArray(value)) {
        return value.length === 0 ? 'This field is required' : ''
      }
      return !value ? 'This field is required' : ''
    }
    return ''
  }, [fields, city?.slug])

  const handleChange = useCallback((name: FieldName, value: FieldValue) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: validateField(name, value, formData) }))
  }, [validateField, formData])

  const validateForm = useCallback(() => {
    const newErrors: Record<FieldName, string> = {}
    const errorList: { field: string; message: string }[] = []

    Object.entries(requiredFields).forEach(([section, sectionFields]) => {
      const validFields = sectionFields.filter(field => fields?.has(field))
      
      validFields.forEach((field) => {
        const value = formData[field]
        const error = validateField(field, value, formData)
        if (error) {
          newErrors[field] = error
          errorList.push({ field, message: error })
        }
      })
    })

    setErrors(newErrors)
    return {
      isValid: errorList.length === 0,
      errors: errorList
    }
  }, [formData, validateField, fields])

  return { formData, errors, handleChange, validateForm, setFormData }
}

