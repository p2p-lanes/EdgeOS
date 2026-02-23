"use client"

import { AnimatePresence, motion } from "framer-motion"
import useCheckoutState from "../hooks/useCheckoutState"
import type { FormDataProps } from "../types"
import PassesCheckout from "./PassesCheckout"
import TransitionScreen from "./TransitionScreen"
import UserInfoForm from "./UserInfoForm"

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
  </div>
)

export const CheckoutContent = ({
  group,
  isLoading,
  error,
  isInvite = false,
}: {
  group: any
  isLoading: boolean
  error: any
  isInvite?: boolean
}) => {
  const {
    checkoutState,
    isSubmitting,
    errorMessage,
    handleSubmit,
    setCheckoutState,
  } = useCheckoutState()

  // Función que maneja el envío del formulario
  const handleFormSubmit = async (formData: FormDataProps): Promise<void> => {
    await handleSubmit(formData, group)
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
              onSubmit={handleFormSubmit}
              isSubmitting={isSubmitting}
              isInvite={isInvite}
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
            <PassesCheckout onBack={() => setCheckoutState("form")} />
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <AnimatePresence mode="wait">{renderCheckoutContent()}</AnimatePresence>

      {errorMessage && (
        <div className="mt-4 p-4 bg-red-100 border border-red-300 text-red-800 rounded-md max-w-lg mx-auto">
          {errorMessage}
        </div>
      )}
    </>
  )
}
