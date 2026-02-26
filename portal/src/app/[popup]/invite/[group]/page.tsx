"use client"

import { Suspense } from "react"
import { CheckoutContent } from "@/app/checkout/components/CheckoutContent"
import { useTenant } from "@/providers/tenantProvider"
import useGetInviteData from "./hook/useGetInviteData"

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
  </div>
)

const InvitePage = () => {
  const { tenant } = useTenant()
  const {
    data: { group },
    error,
    isLoading,
  } = useGetInviteData()

  if (isLoading) {
    return <LoadingFallback />
  }

  return (
    <div
      className={`min-h-screen w-full py-8 flex items-center justify-center ${!tenant?.image_url ? "bg-gradient-to-br from-neutral-100 to-neutral-300" : ""}`}
      style={
        tenant?.image_url
          ? {
              backgroundImage: `url(${tenant.image_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundAttachment: "fixed",
            }
          : undefined
      }
    >
      <div className="container mx-auto">
        <Suspense fallback={<LoadingFallback />}>
          <CheckoutContent
            group={group}
            isLoading={isLoading}
            error={error}
            isInvite={true}
          />
        </Suspense>
      </div>
    </div>
  )
}
export default InvitePage
