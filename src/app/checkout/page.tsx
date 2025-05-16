"use client"

import { Suspense, useEffect, useState } from "react"
import { CheckoutContent } from "./components/CheckoutContent"
import { useCityProvider } from "@/providers/cityProvider"
import useGetCheckoutData from "./hooks/useGetCheckoutData"

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
)

const CheckoutPage = () => {
  const [urlImage, setUrlImage] = useState<string>("")
  const { data: { group }, error, isLoading } = useGetCheckoutData();

  useEffect(() => {
    if(group) {
      const isBhutan = group.popup_name.toLowerCase().includes("bhutan")
      console.log('isBhutan', isBhutan, group.name)
      setUrlImage(isBhutan ? "https://simplefi.s3.us-east-2.amazonaws.com/backgroundBt.jpeg" : "https://simplefi.s3.us-east-2.amazonaws.com/edge-bg.jpg")
    }
  }, [group])

  if(isLoading) {
    return <LoadingFallback />
  }


  return (
    <div 
      className="min-h-screen w-full py-8 flex items-center justify-center"
      style={{
        backgroundImage: `url(${urlImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      <div className="container mx-auto">
        <Suspense fallback={<LoadingFallback />}>
          <CheckoutContent group={group} isLoading={isLoading} error={error}/>
        </Suspense>
      </div>
    </div>
  )
}

export default CheckoutPage