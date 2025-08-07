"use client"

import { CheckoutContent } from "@/app/checkout/components/CheckoutContent";
import { Suspense } from "react";
import useGetInviteData from "./hook/useGetInviteData";



const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
)

const InvitePage = () => {
  const { data: { group }, error, isLoading } = useGetInviteData();

  if(isLoading) {
    return <LoadingFallback />
  }

  return (
    <div 
      className="min-h-screen w-full py-8 flex items-center justify-center"
      style={{
        backgroundImage: group.popup_name.toLowerCase().includes("patagonia") ? `url(https://simplefi.s3.us-east-2.amazonaws.com/edge-patagonia-background.jpeg)` : `url(https://simplefi.s3.us-east-2.amazonaws.com/edge-bg.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      <div className="container mx-auto">
        <Suspense fallback={<LoadingFallback />}>
          <CheckoutContent group={group} isLoading={isLoading} error={error} isInvite={true}/>
        </Suspense>
      </div>
    </div>
  )
}
export default InvitePage