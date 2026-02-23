import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Suspense } from "react"

import { TenantsService } from "@/client"
import { FormPageLayout } from "@/components/Common/FormPageLayout"
import { QueryErrorBoundary } from "@/components/Common/QueryErrorBoundary"
import { TenantForm } from "@/components/forms/TenantForm"
import { Skeleton } from "@/components/ui/skeleton"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/tenants/$id/edit")({
  component: EditTenantPage,
  head: () => ({
    meta: [{ title: "Edit Tenant - EdgeOS" }],
  }),
})

function getTenantQueryOptions(tenantId: string) {
  return {
    queryKey: ["tenants", tenantId],
    queryFn: () => TenantsService.getTenant({ tenantId }),
  }
}

function EditTenantContent({ tenantId }: { tenantId: string }) {
  const navigate = useNavigate()
  const { isSuperadmin } = useAuth()
  const { data: tenant } = useSuspenseQuery(getTenantQueryOptions(tenantId))

  const handleSuccess = () => {
    if (isSuperadmin) {
      navigate({ to: "/tenants" })
    } else {
      navigate({ to: "/" })
    }
  }

  return <TenantForm defaultValues={tenant} onSuccess={handleSuccess} />
}

function EditTenantPage() {
  const { id } = Route.useParams()
  const { isSuperadmin } = useAuth()

  return (
    <FormPageLayout
      title="Edit Tenant"
      description="Update tenant settings and configuration"
      backTo={isSuperadmin ? "/tenants" : "/"}
    >
      <QueryErrorBoundary>
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <EditTenantContent tenantId={id} />
        </Suspense>
      </QueryErrorBoundary>
    </FormPageLayout>
  )
}
