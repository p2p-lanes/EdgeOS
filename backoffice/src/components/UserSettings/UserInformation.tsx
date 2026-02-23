import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { UsersService, type UserUpdate } from "@/client"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingButton } from "@/components/ui/loading-button"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { createErrorHandler } from "@/utils"

const UserInformation = () => {
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const mutation = useMutation({
    mutationFn: (data: UserUpdate) =>
      UsersService.updateUser({ userId: currentUser!.id, requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Profile updated successfully")
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
    onError: createErrorHandler(showErrorToast),
  })

  const form = useForm({
    defaultValues: {
      full_name: currentUser?.full_name ?? "",
    },
    onSubmit: ({ value }) => {
      mutation.mutate({ full_name: value.full_name || null })
    },
  })

  if (!currentUser) return null

  const getRoleLabel = () => {
    switch (currentUser.role) {
      case "superadmin":
        return "Superadmin"
      case "admin":
        return "Admin"
      case "viewer":
        return "Viewer"
      default:
        return currentUser.role
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
            className="space-y-4"
          >
            <form.Field name="full_name">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Full Name</Label>
                  <Input
                    id={field.name}
                    placeholder="Your name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={currentUser.email} disabled />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <div>
                <Badge
                  variant={
                    currentUser.role === "superadmin" ? "default" : "secondary"
                  }
                >
                  {getRoleLabel()}
                </Badge>
              </div>
            </div>

            <div className="pt-4">
              <LoadingButton type="submit" loading={mutation.isPending}>
                Save Changes
              </LoadingButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default UserInformation
