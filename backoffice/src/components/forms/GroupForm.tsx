import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Mail, MessageSquare, Percent, Users } from "lucide-react"
import {
  type GroupAdminUpdate,
  type GroupCreate,
  type GroupPublic,
  GroupsService,
} from "@/client"
import { DangerZone } from "@/components/Common/DangerZone"
import { FieldError } from "@/components/Common/FieldError"
import { WorkspaceAlert } from "@/components/Common/WorkspaceAlert"
import { Button } from "@/components/ui/button"
import {
  HeroInput,
  InlineRow,
  InlineSection,
} from "@/components/ui/inline-form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useWorkspace } from "@/contexts/WorkspaceContext"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import {
  UnsavedChangesDialog,
  useUnsavedChanges,
} from "@/hooks/useUnsavedChanges"
import { createErrorHandler } from "@/utils"

interface GroupFormProps {
  defaultValues?: GroupPublic
  onSuccess: () => void
}

export function GroupForm({ defaultValues, onSuccess }: GroupFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const { selectedPopupId, isContextReady } = useWorkspace()
  const { isAdmin } = useAuth()
  const isEdit = !!defaultValues
  const readOnly = !isAdmin

  const createMutation = useMutation({
    mutationFn: (data: GroupCreate) =>
      GroupsService.createGroup({ requestBody: data }),
    onSuccess: (data) => {
      showSuccessToast("Group created successfully", {
        label: "View",
        onClick: () =>
          navigate({ to: "/groups/$id/edit", params: { id: data.id } }),
      })
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      form.reset()
      onSuccess()
    },
    onError: createErrorHandler(showErrorToast),
  })

  const updateMutation = useMutation({
    mutationFn: (data: GroupAdminUpdate) =>
      GroupsService.updateGroup({
        groupId: defaultValues!.id,
        requestBody: data,
      }),
    onSuccess: () => {
      showSuccessToast("Group updated successfully")
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      form.reset()
      onSuccess()
    },
    onError: createErrorHandler(showErrorToast),
  })

  const deleteMutation = useMutation({
    mutationFn: () => GroupsService.deleteGroup({ groupId: defaultValues!.id }),
    onSuccess: () => {
      showSuccessToast("Group deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      navigate({ to: "/groups" })
    },
    onError: createErrorHandler(showErrorToast),
  })

  const form = useForm({
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      discount_percentage:
        defaultValues?.discount_percentage?.toString() ?? "0",
      max_members: defaultValues?.max_members?.toString() ?? "",
      welcome_message: defaultValues?.welcome_message ?? "",
      whitelisted_emails:
        defaultValues?.whitelisted_emails
          ?.map((e: { email: string }) => e.email)
          .join("\n") ?? "",
    },
    onSubmit: ({ value }) => {
      if (readOnly) return
      if (isEdit) {
        updateMutation.mutate({
          name: value.name,
          description: value.description || undefined,
          discount_percentage: Number(value.discount_percentage) || 0,
          max_members: value.max_members ? Number(value.max_members) : null,
          welcome_message: value.welcome_message || undefined,
          whitelisted_emails: value.whitelisted_emails
            ? value.whitelisted_emails
                .split("\n")
                .map((e: string) => e.trim())
                .filter(Boolean)
            : undefined,
        })
      } else {
        if (!selectedPopupId) {
          showErrorToast("Please select a popup first")
          return
        }
        createMutation.mutate({
          popup_id: selectedPopupId,
          name: value.name,
          description: value.description || undefined,
          discount_percentage: Number(value.discount_percentage) || 0,
          max_members: value.max_members
            ? Number(value.max_members)
            : undefined,
          welcome_message: value.welcome_message || undefined,
          whitelisted_emails: value.whitelisted_emails
            ? value.whitelisted_emails
                .split("\n")
                .map((e: string) => e.trim())
                .filter(Boolean)
            : undefined,
        })
      }
    },
  })

  const blocker = useUnsavedChanges(form)

  const isPending = createMutation.isPending || updateMutation.isPending

  if (!isEdit && !isContextReady) {
    return <WorkspaceAlert resource="group" action="create" />
  }

  return (
    <div className="space-y-6">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          if (!readOnly) {
            form.handleSubmit()
          }
        }}
        className="mx-auto max-w-2xl space-y-6"
      >
        {/* Hero: Name */}
        <div className="space-y-3">
          <form.Field
            name="name"
            validators={{
              onBlur: ({ value }) =>
                !readOnly && !value ? "Name is required" : undefined,
            }}
          >
            {(field) => (
              <div>
                <HeroInput
                  placeholder="Group Name"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={readOnly}
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>
        </div>

        {/* Group metadata (edit only) */}
        {isEdit && (
          <div className="flex gap-6 text-sm text-muted-foreground">
            <div>
              <span className="text-xs uppercase tracking-wider">Slug</span>
              <p className="font-mono">{defaultValues.slug}</p>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider">ID</span>
              <p className="font-mono text-xs">{defaultValues.id}</p>
            </div>
          </div>
        )}

        <Separator />

        {/* Description */}
        <form.Field name="description">
          {(field) => (
            <div className="space-y-2">
              <p className="px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Description
              </p>
              <Textarea
                placeholder="Group description..."
                rows={2}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                disabled={readOnly}
              />
            </div>
          )}
        </form.Field>

        <Separator />

        {/* Settings */}
        <InlineSection title="Settings">
          <form.Field name="discount_percentage">
            {(field) => (
              <InlineRow
                icon={<Percent className="h-4 w-4 text-muted-foreground" />}
                label="Discount %"
                description="Discount for group members"
              >
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={readOnly}
                  className="max-w-24 text-sm"
                />
              </InlineRow>
            )}
          </form.Field>

          <form.Field name="max_members">
            {(field) => (
              <InlineRow
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
                label="Max Members"
                description="Leave empty for unlimited"
              >
                <Input
                  type="number"
                  min={1}
                  placeholder="Unlimited"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={readOnly}
                  className="max-w-32 text-sm"
                />
              </InlineRow>
            )}
          </form.Field>
        </InlineSection>

        <Separator />

        {/* Communication */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 px-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Welcome Message
            </p>
          </div>
          <form.Field name="welcome_message">
            {(field) => (
              <Textarea
                placeholder="Welcome to the group!"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                disabled={readOnly}
              />
            )}
          </form.Field>
        </div>

        <Separator />

        {/* Access Control */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 px-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Whitelisted Emails
              </p>
              <p className="text-xs text-muted-foreground">
                One email per line. Leave empty for an open group.
              </p>
            </div>
          </div>
          <form.Field name="whitelisted_emails">
            {(field) => (
              <Textarea
                placeholder={"email1@example.com\nemail2@example.com"}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                rows={5}
                disabled={readOnly}
              />
            )}
          </form.Field>
        </div>

        <Separator />

        {/* Form Actions */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/groups" })}
          >
            {readOnly ? "Back" : "Cancel"}
          </Button>
          {!readOnly && (
            <LoadingButton type="submit" loading={isPending}>
              {isEdit ? "Save Changes" : "Create Group"}
            </LoadingButton>
          )}
        </div>
      </form>

      {isEdit && !readOnly && (
        <div className="mx-auto max-w-2xl">
          <DangerZone
            description="Once you delete this group, all member associations will be removed. This action cannot be undone."
            onDelete={() => deleteMutation.mutate()}
            isDeleting={deleteMutation.isPending}
            confirmText="Delete Group"
            resourceName={defaultValues.name}
            variant="inline"
          />
        </div>
      )}
      <UnsavedChangesDialog blocker={blocker} />
    </div>
  )
}
