"use client"

import { useState, useEffect, useRef } from "react"
import InputForm, { AddonInputForm } from "@/components/ui/Form/Input"
import RadioGroupForm from "@/components/ui/Form/RadioGroup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Cookies from "js-cookie"
import useCookies from "../hooks/useCookies"
import { OtpInput } from "@/components/ui/otp-input"
import { api, instance } from "@/api"

export interface FormDataProps {
  first_name: string
  last_name: string
  email: string
  telegram: string
  organization: string
  role: string
  gender: string
  email_verified: boolean
}

interface UserInfoFormProps {
  group: any | null
  isLoading: boolean
  error: string | null
  onSubmit: (data: FormDataProps) => Promise<void>
  isSubmitting: boolean
}

const UserInfoForm = ({ group, onSubmit, isSubmitting, isLoading, error }: UserInfoFormProps) => {
  const [formData, setFormData] = useState<FormDataProps>({
    first_name: "",
    last_name: "",
    email: "",
    telegram: "",
    organization: "",
    role: "",
    gender: "male",
    email_verified: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const { getCookie } = useCookies()
  
  // Estados para la verificación de email
  const [showVerificationInput, setShowVerificationInput] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isVerifyingCode, setIsVerifyingCode] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Cargar datos de las cookies al iniciar y verificar token
  useEffect(() => {
    // Verificar si hay un token en localStorage
    const token = window?.localStorage?.getItem('token')
    if (token) {
      // Configurar el token en el header
      instance.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // Marcar el email como verificado para saltar ese paso
      setFormData(prev => ({
        ...prev,
        email_verified: true
      }))
    }
    
    // Cargar datos de las cookies
    const savedData = getCookie()
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setFormData(prev => ({
          // Mantener email_verified si viene del paso anterior (token)
          ...prev,
          ...parsedData,
          // Si encontramos un token, siempre mantener email_verified en true
          email_verified: token ? true : parsedData.email_verified || false
        }))
      } catch (error) {
        console.error("Error al cargar datos de cookies:", error)
      }
    }
  }, [])

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Verificar que tenemos un parámetro group
  useEffect(() => {
    if (error) {
      setErrors({
        general: error
      })
      return;
    }
    if (!group && !isLoading) {
      setErrors({
        general: "Please use a valid invitation link."
      })
    }
  }, [group, isLoading, error])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Si cambia el email, resetear la verificación
    if (field === "email") {
      setFormData(prev => ({
        ...prev,
        email_verified: false
      }))
      setShowVerificationInput(false)
      setVerificationCode("")
    }
    
    // Eliminar error cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const startCountdown = () => {
    setCountdown(60)
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.first_name) newErrors.first_name = "First name is required"
    if (!formData.last_name) newErrors.last_name = "Last name is required"
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email"
    } else if (!formData.email_verified) {
      newErrors.email = "Email verification is required. Please verify your email before continuing."
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
    
    // Si no está verificado y tiene email válido, enviar código
    if (!formData.email_verified && formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      setErrors(prev => ({
        ...prev,
        email: "Invalid email"
      }))
      return
    }

    // Si no está verificado pero tiene email válido, enviar código o verificar código
    if (!formData.email_verified) {
      if (!showVerificationInput) {
        // Enviar código
        await handleSendVerificationCode()
      } else {
        // Verificar código
        await handleVerifyCode()
      }
      return
    }
    
    // Si está verificado, validar y enviar formulario
    if (validateForm()) {
      await onSubmit(formData)
    }
  }

  // Función para enviar código de verificación
  const handleSendVerificationCode = async () => {
    if (!formData.email) {
      setErrors(prev => ({
        ...prev,
        email: "Email is required"
      }))
      return
    }
    
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setErrors(prev => ({
        ...prev,
        email: "Invalid email"
      }))
      return
    }
    
    try {
      setIsSendingCode(true)
      setVerificationError(null)
      
      // Llamada a la API para enviar código
      await api.post("/citizens/authenticate", {
        email: formData.email,
        use_code: true
      })
      
      setShowVerificationInput(true)
      startCountdown()
    } catch (error) {
      console.error("Error sending verification code:", error)
      setVerificationError("Failed to send verification code. Please try again.")
    } finally {
      setIsSendingCode(false)
    }
  }

  // Función para verificar el código
  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setVerificationError("Please enter the full 6-digit code")
      return
    }
    
    try {
      setIsVerifyingCode(true)
      setVerificationError(null)
      
      // Llamada a la API para verificar el código con query params
      const response = await api.post(`/citizens/login?email=${encodeURIComponent(formData.email)}&code=${verificationCode}`)
      
      // Si llegamos aquí es porque la API devolvió 200 o 201
      if (response.status === 200 || response.status === 201) {
        setFormData(prev => ({
          ...prev,
          email_verified: true
        }))
        instance.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`
        window?.localStorage?.setItem('token', response.data.access_token)
        setVerificationError(null)
      } else {
        // Si la respuesta no es 200 o 201, tratar como error
        setVerificationError("Verification failed. Please try again.")
      }
      
    } catch (error: any) {
      console.error("Error verifying code:", error)
      
      // Comprobar el código de estado para mostrar mensajes específicos
      if (error.response) {
        if (error.response.status === 401) {
          setVerificationError("Invalid verification code. Please try again.")
        } else if (error.response.status === 404) {
          setVerificationError("Verification code not found. Please request a new code.")
        } else {
          setVerificationError("Failed to verify code. Please try again.")
        }
      } else {
        setVerificationError("Network error. Please check your connection and try again.")
      }
    } finally {
      setIsVerifyingCode(false)
    }
  }

  // Función para reenviar el código
  const handleResendCode = async () => {
    try {
      setVerificationCode("")
      setVerificationError(null)
      await handleSendVerificationCode()
    } catch (error) {
      console.error("Error resending code:", error)
      setVerificationError("Failed to resend verification code. Please try again.")
    }
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
        <CardTitle className="text-2xl font-bold">Express Checkout</CardTitle>
        <CardDescription>
          You've been invited to join <span className="font-bold">{group?.name}</span> group for <span className="font-bold">{group?.popup_name}</span>, 
          skipping the application process and saving you time. Secure your spot now!
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Email section - visible only when not verified */}
          {!formData.email_verified && (
            <div className="space-y-4">
              <InputForm
                label="Email"
                id="email"
                type="email"
                value={formData.email}
                onChange={(value) => handleInputChange("email", value)}
                error={errors.email}
                isRequired
                placeholder="example@email.com"
                disabled={showVerificationInput && !formData.email_verified}
              />
              
              {/* Verification code input section - visible after sending code */}
              {showVerificationInput && !formData.email_verified && (
                <div className="space-y-2">
                  <div className="flex flex-col items-center space-y-3">
                    <p className="text-sm text-center">
                      We've sent a 6-digit verification code to <span className="font-medium">{formData.email}</span>
                    </p>
                    <OtpInput
                      value={verificationCode}
                      onChange={setVerificationCode}
                      error={verificationError || undefined}
                    />
                    
                    <div className="flex mt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleResendCode}
                        disabled={countdown > 0}
                        className="text-xs ml-auto"
                      >
                        {countdown > 0 ? `Resend Code (${countdown}s)` : "Resend Code"}
                      </Button>
                    </div>
                    
                    {verificationError && (
                      <p className="text-sm text-red-500 text-center">{verificationError}</p>
                    )}
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      Didn&apos;t receive the code? Check your spam folder or click &quot;Resend Code&quot; after the timer expires.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Additional form fields - only visible after email verification */}
          {formData.email_verified && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputForm
                  label="First Name"
                  id="first_name"
                  value={formData.first_name}
                  onChange={(value) => handleInputChange("first_name", value)}
                  error={errors.first_name}
                  isRequired
                  placeholder="Enter your first name"
                />
                
                <InputForm
                  label="Last Name"
                  id="last_name"
                  value={formData.last_name}
                  onChange={(value) => handleInputChange("last_name", value)}
                  error={errors.last_name}
                  isRequired
                  placeholder="Enter your last name"
                />
              </div>
              
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
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={
              isSubmitting || 
              (showVerificationInput && verificationCode.length !== 6 && !formData.email_verified) || 
              isSendingCode ||
              isVerifyingCode
            }
          >
            {isSubmitting 
              ? "Processing..." 
              : formData.email_verified 
                ? "Continue" 
                : showVerificationInput
                  ? "Verify Code"
                  : "Send Code"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default UserInfoForm 