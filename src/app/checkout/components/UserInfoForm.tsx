"use client"

import { useState, useEffect } from "react"
import InputForm, { AddonInputForm } from "@/components/ui/Form/Input"
import RadioGroupForm from "@/components/ui/Form/RadioGroup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export interface FormDataProps {
  fullName: string
  email: string
  telegram: string
  organization: string
  role: string
  gender: string
}

interface UserInfoFormProps {
  groupParam: string | null
  onSubmit: (data: FormDataProps) => Promise<void>
  isSubmitting: boolean
}

const UserInfoForm = ({ groupParam, onSubmit, isSubmitting }: UserInfoFormProps) => {
  const [formData, setFormData] = useState<FormDataProps>({
    fullName: "",
    email: "",
    telegram: "",
    organization: "",
    role: "",
    gender: ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Verificar que tenemos un parámetro group
  useEffect(() => {
    if (!groupParam) {
      setErrors({
        general: "Please use a valid invitation link."
      })
    }
  }, [groupParam])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Eliminar error cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.fullName) newErrors.fullName = "Full name is required"
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email"
    }
    if (!formData.telegram) newErrors.telegram = "Telegram is required"
    if (!formData.organization) newErrors.organization = "Organization is required"
    if (!formData.role) newErrors.role = "Role is required"
    if (!formData.gender) newErrors.gender = "Gender is required"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // if (validateForm()) {
      await onSubmit(formData)
    // }
  }

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "non-binary", label: "Non-binary" },
    { value: "prefer-not-to-say", label: "Prefer not to say" }
  ]

  if(errors.general) {
    return (
      <Card className="max-w-lg mx-auto backdrop-blur bg-white/90">
      <CardHeader>
        <CardTitle className="text-2xl font-bold mb-2">Checkout</CardTitle>
        {errors.general && (
          <div className="mt-6 p-3 bg-red-100 border border-red-300 text-red-800 rounded-md">
            {errors.general}
          </div>
        )}
      </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="max-w-lg mx-auto backdrop-blur bg-white/90">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Checkout</CardTitle>
        <CardDescription>Please complete your information to continue</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <InputForm
            label="Full Name"
            id="fullName"
            value={formData.fullName}
            onChange={(value) => handleInputChange("fullName", value)}
            error={errors.fullName}
            isRequired
            placeholder="Enter your full name"
          />
          
          <InputForm
            label="Email"
            id="email"
            type="email"
            value={formData.email}
            onChange={(value) => handleInputChange("email", value)}
            error={errors.email}
            isRequired
            placeholder="example@email.com"
          />
          
          <AddonInputForm
            label="Telegram"
            id="telegram"
            addon="@"
            value={formData.telegram}
            onChange={(value) => handleInputChange("telegram", value)}
            error={errors.telegram}
            isRequired
            placeholder="username"
          />
          
          <InputForm
            label="Organization"
            id="organization"
            value={formData.organization}
            onChange={(value) => handleInputChange("organization", value)}
            error={errors.organization}
            isRequired
            placeholder="Your organization name"
          />
          
          <InputForm
            label="Role"
            id="role"
            value={formData.role}
            onChange={(value) => handleInputChange("role", value)}
            error={errors.role}
            isRequired
            placeholder="Your role in the organization"
          />
          
          <RadioGroupForm
            label="Gender"
            subtitle="Select your gender"
            value={formData.gender}
            onChange={(value) => handleInputChange("gender", value)}
            error={errors.gender}
            isRequired
            options={genderOptions}
          />
        </CardContent>
        
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Continue"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default UserInfoForm 