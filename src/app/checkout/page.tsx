"use client"

import { Suspense } from "react"
import { CheckoutContent } from "./components/CheckoutContent"

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