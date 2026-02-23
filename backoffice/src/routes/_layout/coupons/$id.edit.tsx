import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Suspense } from "react"

import { CouponsService } from "@/client"
import { FormPageLayout } from "@/components/Common/FormPageLayout"
import { QueryErrorBoundary } from "@/components/Common/QueryErrorBoundary"
import { CouponForm } from "@/components/forms/CouponForm"
import { Skeleton } from "@/components/ui/skeleton"

export const Route = createFileRoute("/_layout/coupons/$id/edit")({
  component: EditCouponPage,
  head: () => ({
    meta: [{ title: "Edit Coupon - EdgeOS" }],
  }),
})

function getCouponQueryOptions(couponId: string) {
  return {
    queryKey: ["coupons", couponId],
    queryFn: () => CouponsService.getCoupon({ couponId }),
  }
}

function EditCouponContent({ couponId }: { couponId: string }) {
  const navigate = useNavigate()
  const { data: coupon } = useSuspenseQuery(getCouponQueryOptions(couponId))

  return (
    <CouponForm
      defaultValues={coupon}
      onSuccess={() => navigate({ to: "/coupons" })}
    />
  )
}

function EditCouponPage() {
  const { id } = Route.useParams()

  return (
    <FormPageLayout
      title="Edit Coupon"
      description="Update coupon settings and discount"
      backTo="/coupons"
    >
      <QueryErrorBoundary>
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <EditCouponContent couponId={id} />
        </Suspense>
      </QueryErrorBoundary>
    </FormPageLayout>
  )
}
