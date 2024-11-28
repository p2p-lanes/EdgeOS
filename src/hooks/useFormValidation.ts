import { useState, useCallback } from 'react'

type FieldName = string
type FieldValue = string | boolean | string[] | string[][]
type FormData = Record<FieldName, FieldValue>

const requiredFields = {
  personalInformation: ['first_name', 'last_name', 'email', 'telegram_username', 'gender', 'age'],
  professionalDetails: ['organization', 'socialMedia'],
  participation: ['duration', 'checkIn', 'checkOut', 'successLookLike', 'topicTracks', 'hostSession'],
  childrenPlusOnes: [],
  scholarship: []
}

export const useFormValidation = (initialData: FormData) => {
  const [formData, setFormData] = useState<FormData>(initialData)
  const [errors, setErrors] = useState<Record<FieldName, string>>({})

  const validateField = useCallback((name: FieldName, value: FieldValue, formData: FormData) => {
    if (Object.values(requiredFields).flat().includes(name)) {
      // Check conditional fields
      if (name === 'spouseName' || name === 'spouseEmail') {
        if (!formData.hasSpouse) return '';
      }
      if (name === 'kidsInfo') {
        if (!formData.hasKids) return '';
      }
      if (name === 'scholarshipType' || name === 'scholarshipReason') {
        if (!formData.isScholarshipInterested) return '';
      }
      if (name === 'builderRole') {
        if (!formData.isBuilder) return '';
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

