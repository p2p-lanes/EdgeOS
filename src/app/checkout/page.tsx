"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import UserInfoForm, { FormDataProps } from "./components/UserInfoForm"
import PassesCheckout from "./components/PassesCheckout"
import TransitionScreen from "./components/TransitionScreen"
import { AnimatePresence, motion } from "framer-motion"
import { instance } from "@/api"
import { useApplication } from "@/providers/applicationProvider"
import Cookies from "js-cookie"
import useGetCheckoutData from "./hooks/useGetCheckoutData"

type CheckoutState = "form" | "processing" | "success" | "passes"
const COOKIE_NAME = "user_form_data_checkout_edge"
const COOKIE_EXPIRY = 7 // días

function CheckoutContent() {
  const searchParams = useSearchParams()
  const groupParam = searchParams.get("group")
  const { setApplications } = useApplication()
  const [checkoutState, setCheckoutState] = useState<CheckoutState>("form")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { data: { group }, error, isLoading } = useGetCheckoutData()

  const handleSubmit = async (formData: FormDataProps): Promise<void> => {
    try {
      setIsSubmitting(true)
      setCheckoutState("processing")

      // Guardar datos en cookies
      Cookies.set(COOKIE_NAME, JSON.stringify(formData), { expires: COOKIE_EXPIRY, sameSite: 'Lax' })

      // Obtenemos la api-key de las variables de entorno
      const apiKey = process.env.NEXT_PUBLIC_X_API_KEY
      
      // Enviamos la solicitud con el header específico para esta petición
      const response = await instance.post(
        `/groups/${groupParam}/new_member`, 
        { ...formData }, 
        { headers: { 'api-key': apiKey } }
      )
      
      const token = response.data.authorization.access_token
      instance.defaults.headers.common['Authorization'] = `Bearer ${token}`
      window?.localStorage?.setItem('token', token)
      const application = response.data
      delete application.authorization

      setApplications([application])
      setCheckoutState("passes")
      setErrorMessage(null)
    } catch (error: any) {
      const msg = error.response.data.detail ?? "Something went wrong. Please try again."
      setErrorMessage(msg)
      setCheckoutState("form")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <LoadingFallback />
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
              group={group}
              isLoading={isLoading}
              error={error}
              onSubmit={handleSubmit}
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

      case "passes":
        return (
          <motion.div
            key="passes"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <PassesCheckout/> 
          </motion.div>
        )
      
      default:
        return null
    }
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {renderCheckoutContent()}
      </AnimatePresence>
      
      {errorMessage && (
        <div className="mt-4 p-4 bg-red-100 border border-red-300 text-red-800 rounded-md max-w-lg mx-auto">
          {errorMessage}
        </div>
      )}
    </>
  )
}

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
)

const CheckoutPage = () => {
  return (
    <div 
      className="min-h-screen w-full py-8 flex items-center justify-center"
      style={{
        backgroundImage: "url('https://simplefi.s3.us-east-2.amazonaws.com/edge-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      <div className="container mx-auto">
        <Suspense fallback={<LoadingFallback />}>
          <CheckoutContent />
        </Suspense>
      </div>
    </div>
  )
}

export default CheckoutPage