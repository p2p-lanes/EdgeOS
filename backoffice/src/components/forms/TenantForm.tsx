import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Image, Mail, User } from "lucide-react"
import {
  type TenantCreate,
  type TenantPublic,
  TenantsService,
  type TenantUpdate,
} from "@/client"
import { DangerZone } from "@/components/Common/DangerZone"
import { FieldError } from "@/components/Common/FieldError"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "@/components/ui/image-upload"
import {
  HeroInput,
  InlineRow,
  InlineSection,
} from "@/components/ui/inline-form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import { Separator } from "@/components/ui/separator"
import useCustomToast from "@/hooks/useCustomToast"
import {
  UnsavedChangesDialog,
  useUnsavedChanges,
} from "@/hooks/useUnsavedChanges"
import { createErrorHandler } from "@/utils"

interface TenantFormProps {
  defaultValues?: TenantPublic
  onSuccess: () => void
}

export function TenantForm({ defaultValues, onSuccess }: TenantFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const isEdit = !!defaultValues

  const createMutation = useMutation({
    mutationFn: (data: TenantCreate) =>
      TenantsService.createTenant({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Tenant created successfully")
      queryClient.invalidateQueries({ queryKey: ["tenants"] })
      form.reset()
      onSuccess()
    },
    onError: createErrorHandler(showErrorToast),
  })

  const updateMutation = useMutation({
    mutationFn: (data: TenantUpdate) =>
      TenantsService.updateTenant({
        tenantId: defaultValues!.id,
        requestBody: data,
      }),
    onSuccess: () => {
      showSuccessToast("Tenant updated successfully")
      queryClient.invalidateQueries({
        queryKey: ["tenants", defaultValues!.id],
      })
      form.reset()
      onSuccess()
    },
    onError: createErrorHandler(showErrorToast),
  })

  const deleteMutation = useMutation({
    mutationFn: () =>
      TenantsService.deleteTenant({ tenantId: defaultValues!.id }),
    onSuccess: () => {
      showSuccessToast("Tenant deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["tenants"] })
      navigate({ to: "/tenants" })
    },
    onError: createErrorHandler(showErrorToast),
  })

  const form = useForm({
    defaultValues: {
      name: defaultValues?.name ?? "",
      sender_email: defaultValues?.sender_email ?? "",
      sender_name: defaultValues?.sender_name ?? "",
      image_url: defaultValues?.image_url ?? "",
      icon_url: defaultValues?.icon_url ?? "",
    },
    onSubmit: ({ value }) => {
      if (isEdit) {
        updateMutation.mutate({
          sender_email: value.sender_email || null,
          sender_name: value.sender_name || null,
          image_url: value.image_url || null,
          icon_url: value.icon_url || null,
        })
      } else {
        createMutation.mutate({
          name: value.name,
          sender_email: value.sender_email || undefined,
          sender_name: value.sender_name || undefined,
          image_url: value.image_url || undefined,
          icon_url: value.icon_url || undefined,
        })
      }
    },
  })

  const blocker = useUnsavedChanges(form)
  const isPending = createMutation.isPending || updateMutation.isPending

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
        {/* Hero: Name */}
        <div className="space-y-3">
          {isEdit ? (
            <h2 className="text-3xl font-semibold">{defaultValues.name}</h2>
          ) : (
            <form.Field
              name="name"
              validators={{
                onBlur: ({ value }) =>
                  !value ? "Name is required" : undefined,
              }}
            >
              {(field) => (
                <div>
                  <HeroInput
                    placeholder="Tenant Name"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>
          )}
        </div>

        {/* Tenant metadata (edit only) */}
        {isEdit && (
          <div className="flex gap-6 text-sm text-muted-foreground">
            <div>
              <span className="text-xs uppercase tracking-wider">ID</span>
              <p className="font-mono text-xs">{defaultValues.id}</p>
            </div>
          </div>
        )}

        <Separator />

        {/* Email Settings */}
        <InlineSection title="Email Settings">
          <form.Field
            name="sender_email"
            validators={{
              onBlur: ({ value }) => {
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                  return "Invalid email address"
                }
                return undefined
              },
            }}
          >
            {(field) => (
              <div>
                <InlineRow
                  icon={<Mail className="h-4 w-4 text-muted-foreground" />}
                  label="Sender Email"
                  description="Email for notifications"
                >
                  <Input
                    placeholder="noreply@acme.com"
                    type="email"
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

          <form.Field name="sender_name">
            {(field) => (
              <InlineRow
                icon={<User className="h-4 w-4 text-muted-foreground" />}
                label="Sender Name"
                description="Display name for emails"
              >
                <Input
                  placeholder="Acme Events"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="max-w-xs text-sm"
                />
              </InlineRow>
            )}
          </form.Field>
        </InlineSection>

        <Separator />

        {/* Branding */}
        <InlineSection title="Branding">
          <form.Field name="image_url">
            {(field) => (
              <div className="space-y-2 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Image className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Cover Image</p>
                    <p className="text-xs text-muted-foreground">
                      Main image for tenant branding
                    </p>
                  </div>
                </div>
                <ImageUpload
                  value={field.state.value || null}
                  onChange={(url) => field.handleChange(url ?? "")}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="icon_url">
            {(field) => (
              <div className="space-y-2 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Image className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Icon</p>
                    <p className="text-xs text-muted-foreground">
                      Small icon for navigation
                    </p>
                  </div>
                </div>
                <ImageUpload
                  value={field.state.value || null}
                  onChange={(url) => field.handleChange(url ?? "")}
                />
              </div>
            )}
          </form.Field>
        </InlineSection>

        <Separator />

        {/* Form Actions */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/tenants" })}
          >
            Cancel
          </Button>
          <LoadingButton type="submit" loading={isPending}>
            {isEdit ? "Save Changes" : "Create Tenant"}
          </LoadingButton>
        </div>
      </form>

      {isEdit && (
        <div className="mx-auto max-w-2xl">
          <DangerZone
            description="Once you delete this tenant, all associated data will be permanently removed. This action cannot be undone."
            onDelete={() => deleteMutation.mutate()}
            isDeleting={deleteMutation.isPending}
            confirmText="Delete Tenant"
            resourceName={defaultValues.name}
            variant="inline"
          />
        </div>
      )}
      <UnsavedChangesDialog blocker={blocker} />
    </div>
  )
}
