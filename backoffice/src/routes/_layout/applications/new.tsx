import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

import { FormPageLayout } from "@/components/Common/FormPageLayout"
import { ApplicationForm } from "@/components/forms/ApplicationForm"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/applications/new")({
  component: NewApplication,
  head: () => ({
    meta: [{ title: "New Application - EdgeOS" }],
  }),
})

function NewApplication() {
  const navigate = useNavigate()
  const { isSuperadmin, isUserLoading } = useAuth()

  // Only superadmins can create applications via backoffice (for testing)
  useEffect(() => {
    if (!isUserLoading && !isSuperadmin) {
      navigate({ to: "/applications", search: {} })
    }
  }, [isSuperadmin, isUserLoading, navigate])

  if (isUserLoading || !isSuperadmin) {
    return null
  }

  return (
    <FormPageLayout
      title="Create Application"
      description="Create a test application with custom fields (Superadmin only)"
      backTo="/applications"
    >
      <ApplicationForm
        onSuccess={() => navigate({ to: "/applications", search: {} })}
      />
    </FormPageLayout>
  )
}
