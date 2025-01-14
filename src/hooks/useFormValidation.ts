import { dynamicForm } from '@/constants'
import { validateVideoUrl } from '@/helpers/validate'
import { useCityProvider } from '@/providers/cityProvider'
import { useState, useCallback, useMemo } from 'react'

type FieldName = string
type FieldValue = string | boolean | string[] | string[][] | null
type FormData = Record<FieldName, FieldValue>

const requiredFields = {
  personalInformation: ['first_name', 'last_name', 'telegram', 'gender', 'age', 'email'],
  professionalDetails: ['organization', 'social_media'],
  participation: ['duration', 'builder_description'],
  childrenPlusOnes: ['spouse_info', 'spouse_email', 'kids_info'],
  scholarship: ['scholarship_video_url'],
}

export const useFormValidation = (initialData: FormData) => {
  const [formData, setFormData] = useState<FormData>(initialData)
  const [errors, setErrors] = useState<Record<FieldName, string>>({})
  const { getCity } = useCityProvider()
  const city = getCity()

  const fields = useMemo(() => city?.slug ? new Set(dynamicForm[city.slug]?.fields) : null, [city])

  const validateField = useCallback((name: FieldName, value: FieldValue, formData: FormData) => {
    if (!fields?.has(name)) return ''

    const isVideoValid = validateVideoUrl(formData.video_url)
    
    if (isVideoValid) {
      const requiredWithVideo = [
        ...requiredFields.personalInformation,
        ...requiredFields.childrenPlusOnes,
        ...requiredFields.scholarship
      ].filter(field => fields.has(field))
      
      if (!requiredWithVideo.includes(name)) return ''
    }

    const isRequired = Object.values(requiredFields).flat().includes(name) && fields.has(name)
    if (isRequired) {
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
        console.log('formData.scholarship_request', formData.scholarship_request)
        if (!formData.scholarship_request || validateVideoUrl(formData.scholarship_video_url)) return '';
      }

      if (Array.isArray(value)) {
        return value.length === 0 ? 'This field is required' : ''
      }
      return !value ? 'This field is required' : ''
    }
    return ''
  }, [fields])

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

