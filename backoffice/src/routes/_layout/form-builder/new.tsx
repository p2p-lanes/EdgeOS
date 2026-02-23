import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

import { FormPageLayout } from "@/components/Common/FormPageLayout"
import { WorkspaceAlert } from "@/components/Common/WorkspaceAlert"
import { FormFieldForm } from "@/components/forms/FormFieldForm"
import { useWorkspace } from "@/contexts/WorkspaceContext"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/form-builder/new")({
  component: NewFormField,
  head: () => ({
    meta: [{ title: "New Form Field - EdgeOS" }],
  }),
})

function NewFormField() {
  const navigate = useNavigate()
  const { isAdmin, isUserLoading } = useAuth()
  const { isContextReady } = useWorkspace()

  // Redirect viewers to form-fields list - they cannot create new fields
  useEffect(() => {
    if (!isUserLoading && !isAdmin) {
      navigate({ to: "/form-builder" })
    }
  }, [isAdmin, isUserLoading, navigate])

  if (isUserLoading || !isAdmin) {
    return null
  }

  // Show alert if no popup selected
  if (!isContextReady) {
    return (
      <FormPageLayout
        title="Create Form Field"
        description="Add a custom field to application forms"
        backTo="/form-builder"
      >
        <WorkspaceAlert resource="form field" action="create" />
      </FormPageLayout>
    )
  }

  return (
    <FormPageLayout
      title="Create Form Field"
      description="Add a custom field to application forms"
      backTo="/form-builder"
    >
      <FormFieldForm onSuccess={() => navigate({ to: "/form-builder" })} />
    </FormPageLayout>
  )
}
