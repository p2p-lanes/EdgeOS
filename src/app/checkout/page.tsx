"use client"

import { useState } from "react"
import InputForm from "@/components/ui/Form/Input"
import SelectForm from "@/components/ui/Form/Select"
import RadioGroupForm from "@/components/ui/Form/RadioGroup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const CheckoutPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    telegram: "",
    organization: "",
    role: "",
    gender: ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      // Aquí iría la lógica para procesar el formulario
      console.log("Formulario enviado:", formData)
    }
  }

  const roleOptions = [
    { value: "developer", label: "Developer" },
    { value: "designer", label: "Designer" },
    { value: "manager", label: "Manager" },
    { value: "other", label: "Other" }
  ]

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "non-binary", label: "Non-binary" },
    { value: "prefer-not-to-say", label: "Prefer not to say" }
  ]

  return (
    <div className="container mx-auto py-8 min-h-screen">
      <Card className="max-w-lg mx-auto">
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
            
            <InputForm
              label="Telegram"
              id="telegram"
              value={formData.telegram}
              onChange={(value) => handleInputChange("telegram", value)}
              error={errors.telegram}
              isRequired
              placeholder="@username"
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
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default CheckoutPage