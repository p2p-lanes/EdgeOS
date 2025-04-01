"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import UserInfoForm, { FormDataProps } from "./components/UserInfoForm"
import PassesCheckout from "./components/PassesCheckout"
import TransitionScreen from "./components/TransitionScreen"
import { AnimatePresence, motion } from "framer-motion"
import { api, instance } from "@/api"
import { useApplication } from "@/providers/applicationProvider"
import Cookies from "js-cookie"
import useGetCheckoutData from "./hooks/useGetCheckoutData"
import useCookies from "./hooks/useCookies"

type CheckoutState = "form" | "processing" | "success" | "passes"


function CheckoutContent() {
  const searchParams = useSearchParams()
  const groupParam = searchParams.get("group")
  const { setApplications } = useApplication()
  const [checkoutState, setCheckoutState] = useState<CheckoutState>("form")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { data: { group }, error, isLoading } = useGetCheckoutData()
  const { setCookie } = useCookies()

  const handleSubmit = async (formData: FormDataProps): Promise<void> => {
    try {
      setIsSubmitting(true)
      setCheckoutState("processing")

      // Guardar datos en cookies
      setCookie(JSON.stringify({...formData, group_id: group.id, popup_city_id: group.popup_city_id}))
      
      // Enviamos la solicitud con el header específico para esta petición
      const response = await api.post(
        `/groups/${groupParam}/new_member`, 
        { ...formData }, 
      )

      const application = response.data

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