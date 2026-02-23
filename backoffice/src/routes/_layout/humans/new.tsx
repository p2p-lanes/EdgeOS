import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

import { FormPageLayout } from "@/components/Common/FormPageLayout"
import { HumanForm } from "@/components/forms/HumanForm"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/humans/new")({
  component: NewHuman,
  head: () => ({
    meta: [{ title: "New Human - EdgeOS" }],
  }),
})

function NewHuman() {
  const navigate = useNavigate()
  const { isSuperadmin, isUserLoading } = useAuth()

  // Only superadmins can create humans via backoffice (for testing)
  useEffect(() => {
    if (!isUserLoading && !isSuperadmin) {
      navigate({ to: "/humans" })
    }
  }, [isSuperadmin, isUserLoading, navigate])

  if (isUserLoading || !isSuperadmin) {
    return null
  }

  return (
    <FormPageLayout
      title="Create Human"
      description="Create a test human (Superadmin only)"
      backTo="/humans"
    >
      <HumanForm onSuccess={() => navigate({ to: "/humans" })} />
    </FormPageLayout>
  )
}
