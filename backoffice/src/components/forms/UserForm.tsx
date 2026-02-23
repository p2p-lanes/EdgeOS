import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Mail, Shield } from "lucide-react"
import { z } from "zod"
import {
  type UserCreate,
  type UserPublic,
  type UserRole,
  UsersService,
  type UserUpdate,
} from "@/client"
import { DangerZone } from "@/components/Common/DangerZone"
import { FieldError } from "@/components/Common/FieldError"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  HeroInput,
  InlineRow,
  InlineSection,
} from "@/components/ui/inline-form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useWorkspace } from "@/contexts/WorkspaceContext"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import {
  UnsavedChangesDialog,
  useUnsavedChanges,
} from "@/hooks/useUnsavedChanges"
import { createErrorHandler } from "@/utils"

const emailSchema = z.string().email({ message: "Invalid email address" })
const roleSchema = z.enum(["superadmin", "admin", "viewer"] as const)

const ROLE_OPTIONS: {
  value: UserRole
  label: string
  description: string
}[] = [
  {
    value: "superadmin",
    label: "Superadmin",
    description: "Full platform access",
  },
  {
    value: "admin",
    label: "Admin",
    description: "Full tenant access",
  },
  {
    value: "viewer",
    label: "Viewer",
    description: "Read-only access",
  },
]

interface UserFormProps {
  defaultValues?: UserPublic
  onSuccess: () => void
}

export function UserForm({ defaultValues, onSuccess }: UserFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const { isSuperadmin, user: currentUser } = useAuth()
  const { effectiveTenantId } = useWorkspace()
  const isEdit = !!defaultValues
  const isCurrentUser = currentUser?.id === defaultValues?.id

  const availableRoles = isSuperadmin
    ? ROLE_OPTIONS
    : ROLE_OPTIONS.filter((r) => r.value !== "superadmin")

  const createMutation = useMutation({
    mutationFn: (data: UserCreate) =>
      UsersService.createUser({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast(
        "User created successfully. They can now log in with their email.",
      )
      queryClient.invalidateQueries({ queryKey: ["users"] })
      form.reset()
      onSuccess()
    },
    onError: createErrorHandler(showErrorToast),
  })

  const updateMutation = useMutation({
    mutationFn: (data: UserUpdate) =>
      UsersService.updateUser({
        userId: defaultValues!.id,
        requestBody: data,
      }),
    onSuccess: () => {
      showSuccessToast("User updated successfully")
      queryClient.invalidateQueries({ queryKey: ["users"] })
      form.reset()
      onSuccess()
    },
    onError: createErrorHandler(showErrorToast),
  })

  const deleteMutation = useMutation({
    mutationFn: () => UsersService.deleteUser({ userId: defaultValues!.id }),
    onSuccess: () => {
      showSuccessToast("User deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["users"] })
      navigate({ to: "/admin" })
    },
    onError: createErrorHandler(showErrorToast),
  })

  const form = useForm({
    defaultValues: {
      email: defaultValues?.email ?? "",
      full_name: defaultValues?.full_name ?? "",
      role: (defaultValues?.role ?? "viewer") as UserRole,
      tenant_id: defaultValues?.tenant_id ?? effectiveTenantId,
    },
    onSubmit: ({ value }) => {
      if (isEdit) {
        updateMutation.mutate({
          full_name: value.full_name || null,
          role: value.role,
        })
      } else {
        const submitData: UserCreate = {
          email: value.email,
          full_name: value.full_name || undefined,
          role: value.role,
          tenant_id: value.role === "superadmin" ? null : value.tenant_id,
        }
        createMutation.mutate(submitData)
      }
    },
  })

  const blocker = useUnsavedChanges(form)
  const isPending = createMutation.isPending || updateMutation.isPending

  const getRoleBadgeVariant = (role: UserRole) => {
    if (role === "superadmin") return "default" as const
    if (role === "admin") return "secondary" as const
    return "outline" as const
  }

  return (
    <div className="space-y-6">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="mx-auto max-w-2xl space-y-6"
      >
        {/* Hero: Full Name + Role Badge */}
        <div className="space-y-3">
          <form.Field name="full_name">
            {(field) => (
              <HeroInput
                placeholder="Full Name"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>

          <form.Field
            name="role"
            validators={{
              onBlur: ({ value }) => {
                const result = roleSchema.safeParse(value)
                return result.success
                  ? undefined
                  : result.error.issues[0].message
              },
            }}
          >
            {(field) => (
              <div>
                <div className="flex items-center gap-2">
                  <Select
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val as UserRole)}
                    disabled={isCurrentUser}
                  >
                    <SelectTrigger className="w-auto border-0 bg-transparent p-0 shadow-none focus:ring-0">
                      <Badge variant={getRoleBadgeVariant(field.state.value)}>
                        <SelectValue />
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem
                          key={role.value}
                          value={role.value}
                          textValue={role.label}
                        >
                          <div className="flex flex-col">
                            <span>{role.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {role.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isCurrentUser && (
                    <span className="text-xs text-muted-foreground">
                      (cannot change own role)
                    </span>
                  )}
                </div>
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>
        </div>

        {/* User metadata (edit only) */}
        {isEdit && (
          <div className="flex gap-6 text-sm text-muted-foreground">
            <div>
              <span className="text-xs uppercase tracking-wider">Email</span>
              <p className="font-mono">{defaultValues.email}</p>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider">ID</span>
              <p className="font-mono text-xs">{defaultValues.id}</p>
            </div>
          </div>
        )}

        <Separator />

        {/* Account */}
        <InlineSection title="Account">
          {!isEdit && (
            <form.Field
              name="email"
              validators={{
                onBlur: ({ value }) => {
                  const result = emailSchema.safeParse(value)
                  return result.success
                    ? undefined
                    : result.error.issues[0].message
                },
              }}
            >
              {(field) => (
                <div>
                  <InlineRow
                    icon={<Mail className="h-4 w-4 text-muted-foreground" />}
                    label="Email"
                  >
                    <Input
                      placeholder="user@example.com"
                      type="email"
                      autoComplete="off"
                      spellCheck={false}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="max-w-xs text-sm"
                    />
                  </InlineRow>
                  <FieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>
          )}

          {isEdit && (
            <InlineRow
              icon={<Shield className="h-4 w-4 text-muted-foreground" />}
              label="Role"
              description={
                ROLE_OPTIONS.find((r) => r.value === defaultValues.role)
                  ?.description
              }
            >
              <Badge variant={getRoleBadgeVariant(defaultValues.role)}>
                {
                  ROLE_OPTIONS.find((r) => r.value === defaultValues.role)
                    ?.label
                }
              </Badge>
            </InlineRow>
          )}
        </InlineSection>

        <Separator />

        {/* Form Actions */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/admin" })}
          >
            Cancel
          </Button>
          <LoadingButton type="submit" loading={isPending}>
            {isEdit ? "Save Changes" : "Create User"}
          </LoadingButton>
        </div>
      </form>

      {isEdit && !isCurrentUser && (
        <div className="mx-auto max-w-2xl">
          <DangerZone
            description="Once you delete this user, they will no longer be able to access the platform. This action cannot be undone."
            onDelete={() => deleteMutation.mutate()}
            isDeleting={deleteMutation.isPending}
            confirmText="Delete User"
            resourceName={defaultValues.email}
            variant="inline"
          />
        </div>
      )}
      <UnsavedChangesDialog blocker={blocker} />
    </div>
  )
}
