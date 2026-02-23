import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

import { FormPageLayout } from "@/components/Common/FormPageLayout"
import { CouponForm } from "@/components/forms/CouponForm"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/coupons/new")({
  component: NewCoupon,
  head: () => ({
    meta: [{ title: "New Coupon - EdgeOS" }],
  }),
})

function NewCoupon() {
  const navigate = useNavigate()
  const { isAdmin, isUserLoading } = useAuth()

  // Redirect viewers to coupons list - they cannot create new coupons
  useEffect(() => {
    if (!isUserLoading && !isAdmin) {
      navigate({ to: "/coupons" })
    }
  }, [isAdmin, isUserLoading, navigate])

  if (isUserLoading || !isAdmin) {
    return null
  }

  return (
    <FormPageLayout
      title="Create Coupon"
      description="Add a new discount coupon for the event"
      backTo="/coupons"
    >
      <CouponForm onSuccess={() => navigate({ to: "/coupons" })} />
    </FormPageLayout>
  )
}
