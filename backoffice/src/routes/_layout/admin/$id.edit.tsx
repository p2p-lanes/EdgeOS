import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Suspense } from "react"

import { UsersService } from "@/client"
import { FormPageLayout } from "@/components/Common/FormPageLayout"
import { QueryErrorBoundary } from "@/components/Common/QueryErrorBoundary"
import { UserForm } from "@/components/forms/UserForm"
import { Skeleton } from "@/components/ui/skeleton"

export const Route = createFileRoute("/_layout/admin/$id/edit")({
  component: EditUserPage,
  head: () => ({
    meta: [{ title: "Edit User - EdgeOS" }],
  }),
})

function getUserQueryOptions(userId: string) {
  return {
    queryKey: ["users", userId],
    queryFn: () => UsersService.getUser({ userId }),
  }
}

function EditUserContent({ userId }: { userId: string }) {
  const navigate = useNavigate()
  const { data: user } = useSuspenseQuery(getUserQueryOptions(userId))

  return (
    <UserForm
      defaultValues={user}
      onSuccess={() => navigate({ to: "/admin" })}
    />
  )
}

function EditUserPage() {
  const { id } = Route.useParams()

  return (
    <FormPageLayout
      title="Edit User"
      description="Update user details and permissions"
      backTo="/admin"
    >
      <QueryErrorBoundary>
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <EditUserContent userId={id} />
        </Suspense>
      </QueryErrorBoundary>
    </FormPageLayout>
  )
}
