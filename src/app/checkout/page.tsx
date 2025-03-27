"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader } from "@/components/ui/Loader"
import UserInfoForm, { FormDataProps } from "./components/UserInfoForm"
import PassesCheckout from "./components/PassesCheckout"
import TransitionScreen from "./components/TransitionScreen"
import { AnimatePresence, motion } from "framer-motion"

// Mock de datos de aplicación
const MOCK_APPLICATION_DATA = {
  id: 123,
  popup_slug: "devcon",
  popup_city_id: 1,
  status: "active",
  attendees: [
    {
      id: 1,
      name: "Main Attendee",
      category: "main",
      email: "",
      products: []
    }
  ],
  discount_assigned: 0
}

// Estados posibles del checkout
type CheckoutState = "form" | "processing" | "success" | "passes"

const CheckoutPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const groupParam = searchParams.get("group")
  
  const [checkoutState, setCheckoutState] = useState<CheckoutState>("form")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applicationData, setApplicationData] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Simulación de envío de datos a API
  const mockApiSubmit = async (formData: FormDataProps): Promise<void> => {
    try {
      setIsSubmitting(true)
      setCheckoutState("processing")
      
      // Simulamos un delay para imitar la llamada a la API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock de respuesta exitosa
      const response = {
        success: true,
        application: {
          ...MOCK_APPLICATION_DATA,
          attendees: [
            {
              ...MOCK_APPLICATION_DATA.attendees[0],
              name: formData.fullName,
              email: formData.email
            }
          ]
        }
      }
      
      // Si es exitoso, cambiamos a la pantalla de éxito
      setApplicationData(response.application)
      setCheckoutState("success")
      
      // Después de mostrar el éxito, cambiamos a la pantalla de passes
      setTimeout(() => {
        setCheckoutState("passes")
      }, 2000)
      
      // En un caso real, podrías redirigir utilizando router.push
      // router.push(`/portal/${response.application.popup_slug}/passes`)
    } catch (error) {
      console.error("Error submitting form:", error)
      setErrorMessage("Something went wrong. Please try again.")
      setCheckoutState("form")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Renderizado condicional basado en el estado del checkout
  const renderCheckoutContent = () => {
    switch (checkoutState) {
      case "form":
        return (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <UserInfoForm
              groupParam={groupParam}
              onSubmit={mockApiSubmit}
              isSubmitting={isSubmitting}
            />
          </motion.div>
        )
      
      case "processing":
        return (
          <TransitionScreen
            message="Processing your registration"
            isPending={true}
            isSuccess={false}
          />
        )
      
      case "success":
        return (
          <TransitionScreen
            message="Registration successful"
            isPending={false}
            isSuccess={true}
          />
        )
      
      case "passes":
        return (
          <motion.div
            key="passes"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <PassesCheckout applicationData={applicationData} />
          </motion.div>
        )
      
      default:
        return null
    }
  }

  return (
    <div 
      className="min-h-screen w-full py-8 flex items-center justify-center"
      style={{
        backgroundImage: "url('https://simplefi.s3.us-east-2.amazonaws.com/edge-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="container mx-auto">
        <AnimatePresence mode="wait">
          {renderCheckoutContent()}
        </AnimatePresence>
        
        {errorMessage && (
          <div className="mt-4 p-4 bg-red-100 border border-red-300 text-red-800 rounded-md max-w-lg mx-auto">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckoutPage