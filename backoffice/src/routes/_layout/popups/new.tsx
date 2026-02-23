import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

import { FormPageLayout } from "@/components/Common/FormPageLayout"
import { PopupForm } from "@/components/forms/PopupForm"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/popups/new")({
  component: NewPopup,
  head: () => ({
    meta: [{ title: "New Popup - EdgeOS" }],
  }),
})

function NewPopup() {
  const navigate = useNavigate()
  const { isAdmin, isUserLoading } = useAuth()

  // Redirect viewers to popups list - they cannot create new popups
  useEffect(() => {
    if (!isUserLoading && !isAdmin) {
      navigate({ to: "/popups" })
    }
  }, [isAdmin, isUserLoading, navigate])

  if (isUserLoading || !isAdmin) {
    return null
  }

  return (
    <FormPageLayout
      title="Create Popup"
      description="Add a new popup to manage"
      backTo="/popups"
    >
      <PopupForm onSuccess={() => navigate({ to: "/popups" })} />
    </FormPageLayout>
  )
}
