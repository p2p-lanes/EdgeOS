"use client"

import { CheckoutContent } from "@/app/checkout/components/CheckoutContent";
import { Suspense } from "react";
import useGetInviteData from "./hook/useGetInviteData";



const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
)

const InvalidLinkMessage = () => (
  <div className="flex flex-col items-center justify-center h-screen gap-4 px-4">
    <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center space-y-4">
      <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 className="text-xl font-semibold text-gray-900">Invalid Invite Link</h1>
      <p className="text-sm text-gray-500">This invite link is no longer valid or the event is not currently available.</p>
    </div>
  </div>
)

const InvitePage = () => {
  const { data: { group }, error, isLoading } = useGetInviteData();

  if(isLoading) {
    return <LoadingFallback />
  }

  if(error || !group) {
    return <InvalidLinkMessage />
  }

  return (
    <div 
      className="min-h-screen w-full py-8 flex items-center justify-center"
      style={{
        backgroundImage: group?.express_checkout_background ? `url(${group.express_checkout_background})` : `url(https://simplefi.s3.us-east-2.amazonaws.com/edge-bg.jpg)`,
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