"use client"

import { useTenant } from "@/providers/tenantProvider"
import { CheckInForm } from "./components/checkinForm"

const CheckInPage = () => {
  const { tenant } = useTenant()

  return (
    <div className="flex items-center justify-center p-4 h-screen">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        {tenant?.image_url ? (
          <img
            src={tenant.image_url}
            alt={tenant.name ?? "Background"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-neutral-200 to-neutral-400" />
        )}
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-xl">
        <CheckInForm />
      </div>
    </div>
  )
}
export default CheckInPage
