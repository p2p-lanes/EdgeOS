import { createFileRoute, useNavigate } from "@tanstack/react-router"

import { FormPageLayout } from "@/components/Common/FormPageLayout"
import { UserForm } from "@/components/forms/UserForm"

export const Route = createFileRoute("/_layout/admin/new")({
  component: NewUser,
  head: () => ({
    meta: [{ title: "New User - EdgeOS" }],
  }),
})

function NewUser() {
  const navigate = useNavigate()

  return (
    <FormPageLayout
      title="Add User"
      description="Create a new user account"
      backTo="/admin"
    >
      <UserForm onSuccess={() => navigate({ to: "/admin" })} />
    </FormPageLayout>
  )
}
