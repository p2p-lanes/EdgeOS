import { useState, useCallback } from 'react'

type FieldName = string
type FieldValue = string | boolean | string[] | string[][] | null
type FormData = Record<FieldName, FieldValue>

const requiredFields = {
  personalInformation: ['first_name', 'last_name', 'telegram', 'gender', 'age'],
  professionalDetails: ['organization', 'social_media'],
  participation: ['duration'],
  childrenPlusOnes: [],
  scholarship: []
}

export const useFormValidation = (initialData: FormData) => {
  const [formData, setFormData] = useState<FormData>(initialData)
  const [errors, setErrors] = useState<Record<FieldName, string>>({})

  const validateField = useCallback((name: FieldName, value: FieldValue, formData: FormData) => {
    if (Object.values(requiredFields).flat().includes(name)) {
      // Check conditional fields
      if (name === 'spouse_info' || name === 'spouse_email') {
        if (!formData.brings_spouse) return '';
      }
      if (name === 'kids_info') {
        if (!formData.brings_kids) return '';
      }
      if (name === 'scholarship_categories' || name === 'scholarship_details') {
        if (!formData.scolarship_request) return '';
      }
      if (name === 'builder_boolean') {
        if (!formData.builder_boolean) return '';
      }

      if (Array.isArray(value)) {
        return value.length === 0 ? 'This field is required' : ''
      }
      return !value ? 'This field is required' : ''
    }
    return ''
  }, [])

  const handleChange = useCallback((name: FieldName, value: FieldValue) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: validateField(name, value, formData) }))
  }, [validateField, formData])

  const validateForm = useCallback(() => {
    const newErrors: Record<FieldName, string> = {}
    const errorList: { field: string; message: string }[] = []

    Object.entries(requiredFields).forEach(([section, fields]) => {
      fields.forEach((field) => {
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
  }, [formData, validateField])

  return { formData, errors, handleChange, validateForm, setFormData }
}

