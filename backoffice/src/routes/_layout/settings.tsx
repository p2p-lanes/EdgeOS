import { createFileRoute } from "@tanstack/react-router"

import DeleteAccount from "@/components/UserSettings/DeleteAccount"
import UserInformation from "@/components/UserSettings/UserInformation"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/settings")({
  component: UserSettings,
  head: () => ({
    meta: [
      {
        title: "Settings - EdgeOS",
      },
    ],
  }),
})

function UserSettings() {
  const { user: currentUser, isSuperadmin } = useAuth()

  if (!currentUser) {
    return null
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <UserInformation />

      {!isSuperadmin && <DeleteAccount />}
    </div>
  )
}
