import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import {
  Baby,
  Calendar,
  FileText,
  Globe,
  Heart,
  Image,
  Key,
  Ticket,
  Twitter,
} from "lucide-react"
import {
  ApprovalStrategiesService,
  type PopupCreate,
  type PopupPublic,
  PopupsService,
  type PopupUpdate,
} from "@/client"
import { DangerZone } from "@/components/Common/DangerZone"
import { FieldError } from "@/components/Common/FieldError"
import { FormErrorSummary } from "@/components/Common/FormErrorSummary"
import { ApprovalStrategyForm } from "@/components/forms/ApprovalStrategyForm"
import { ReviewersManager } from "@/components/forms/ReviewersManager"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { ImageUpload } from "@/components/ui/image-upload"
import {
  HeroInput,
  InlineRow,
  InlineSection,
} from "@/components/ui/inline-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingButton } from "@/components/ui/loading-button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import {
  UnsavedChangesDialog,
  useUnsavedChanges,
} from "@/hooks/useUnsavedChanges"
import { createErrorHandler } from "@/utils"

interface PopupFormProps {
  defaultValues?: PopupPublic
  onSuccess: () => void
}

const POPUP_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
] as const

export function PopupForm({ defaultValues, onSuccess }: PopupFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const { isAdmin } = useAuth()
  const isEdit = !!defaultValues
  const readOnly = !isAdmin

  const createMutation = useMutation({
    mutationFn: (data: PopupCreate) =>
      PopupsService.createPopup({ requestBody: data }),
    onSuccess: (data) => {
      showSuccessToast("Popup created successfully", {
        label: "View",
        onClick: () =>
          navigate({ to: "/popups/$id/edit", params: { id: data.id } }),
      })
      queryClient.invalidateQueries({ queryKey: ["popups"] })
      form.reset()
      onSuccess()
    },
    onError: createErrorHandler(showErrorToast),
  })

  const updateMutation = useMutation({
    mutationFn: (data: PopupUpdate) =>
      PopupsService.updatePopup({
        popupId: defaultValues!.id,
        requestBody: data,
      }),
    onSuccess: () => {
      showSuccessToast("Popup updated successfully")
      queryClient.invalidateQueries({ queryKey: ["popups"] })
      form.reset()
      onSuccess()
    },
    onError: createErrorHandler(showErrorToast),
  })

  const deleteMutation = useMutation({
    mutationFn: () => PopupsService.deletePopup({ popupId: defaultValues!.id }),
    onSuccess: () => {
      showSuccessToast("Popup deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["popups"] })
      navigate({ to: "/popups" })
    },
    onError: createErrorHandler(showErrorToast),
  })

  const formatDateForInput = (date: string | null | undefined) => {
    if (!date) return ""
    return date.slice(0, 10)
  }

  const form = useForm({
    defaultValues: {
      name: defaultValues?.name ?? "",
      slug: defaultValues?.slug ?? "",
      status: defaultValues?.status ?? "draft",
      start_date: formatDateForInput(defaultValues?.start_date),
      end_date: formatDateForInput(defaultValues?.end_date),
      allows_spouse: defaultValues?.allows_spouse ?? false,
      allows_children: defaultValues?.allows_children ?? false,
      allows_coupons: defaultValues?.allows_coupons ?? false,
      image_url: defaultValues?.image_url ?? "",
      icon_url: defaultValues?.icon_url ?? "",
      express_checkout_background:
        defaultValues?.express_checkout_background ?? "",
      web_url: defaultValues?.web_url ?? "",
      blog_url: defaultValues?.blog_url ?? "",
      twitter_url: defaultValues?.twitter_url ?? "",
      simplefi_api_key: defaultValues?.simplefi_api_key ?? "",
    },
    onSubmit: ({ value }) => {
      if (readOnly) return
      const toUTCDate = (dateStr: string) => {
        if (!dateStr) return null
        return `${dateStr.slice(0, 10)}T00:00:00.000Z`
      }
      const payload = {
        name: value.name,
        slug: value.slug || undefined,
        status: value.status as PopupCreate["status"],
        start_date: toUTCDate(value.start_date),
        end_date: toUTCDate(value.end_date),
        allows_spouse: value.allows_spouse,
        allows_children: value.allows_children,
        allows_coupons: value.allows_coupons,
        image_url: value.image_url || null,
        icon_url: value.icon_url || null,
        express_checkout_background: value.express_checkout_background || null,
        web_url: value.web_url || null,
        blog_url: value.blog_url || null,
        twitter_url: value.twitter_url || null,
        simplefi_api_key: value.simplefi_api_key || null,
      }
      if (isEdit) {
        updateMutation.mutate(payload)
      } else {
        createMutation.mutate(payload)
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
          if (!readOnly) {
            form.handleSubmit()
          }
        }}
        className="mx-auto max-w-2xl space-y-6"
      >
        <FormErrorSummary
          form={form}
          fieldLabels={{
            name: "Popup Name",
            slug: "Slug",
            start_date: "Start Date",
            end_date: "End Date",
          }}
        />

        {/* Hero: Name + Status */}
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
                  placeholder="Popup Name"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={readOnly}
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <form.Field name="status">
            {(field) => (
              <div className="flex items-center gap-2">
                <Select
                  value={field.state.value}
                  onValueChange={(value) =>
                    field.handleChange(value as typeof field.state.value)
                  }
                  disabled={readOnly}
                >
                  <SelectTrigger className="w-auto border-0 bg-transparent p-0 shadow-none focus:ring-0">
                    <Badge
                      variant={
                        field.state.value === "active" ? "default" : "secondary"
                      }
                    >
                      <SelectValue />
                    </Badge>
                  </SelectTrigger>
                  <SelectContent>
                    {POPUP_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>
        </div>

        {/* Popup Details - right after identity (edit only) */}
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

        {/* Cover Image */}
        <form.Field name="image_url">
          {(field) => (
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Cover Image
              </Label>
              <ImageUpload
                value={field.state.value || null}
                onChange={(url) => field.handleChange(url ?? "")}
                disabled={readOnly}
              />
            </div>
          )}
        </form.Field>

        <Separator />

        {/* Event Details */}
        <InlineSection title="Event Details">
          <form.Field
            name="start_date"
            validators={{
              onChange: ({ value }) => {
                if (readOnly || !value || isEdit) return undefined
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const startDate = new Date(value)
                startDate.setHours(0, 0, 0, 0)
                if (startDate < today) {
                  return "Start date must be today or in the future"
                }
                return undefined
              },
            }}
          >
            {(field) => (
              <div>
                <InlineRow
                  icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
                  label="Start Date"
                >
                  <DatePicker
                    id="start_date"
                    value={field.state.value}
                    onChange={field.handleChange}
                    disabled={readOnly}
                    placeholder="Select date"
                    className="w-auto"
                  />
                </InlineRow>
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => state.values.start_date}>
            {(startDate) => {
              const startDateAsDate = startDate
                ? (() => {
                    const [y, m, d] = startDate
                      .slice(0, 10)
                      .split("-")
                      .map(Number)
                    return new Date(y, m - 1, d)
                  })()
                : undefined
              return (
                <form.Field
                  name="end_date"
                  validators={{
                    onChange: ({ value, fieldApi }) => {
                      if (readOnly || !value) return undefined
                      const startDateValue =
                        fieldApi.form.getFieldValue("start_date")
                      if (!startDateValue) return undefined
                      const sd = new Date(startDateValue)
                      const endDate = new Date(value)
                      if (endDate < sd) {
                        return "End date cannot be before start date"
                      }
                      return undefined
                    },
                  }}
                >
                  {(field) => (
                    <div>
                      <InlineRow
                        icon={
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                        }
                        label="End Date"
                      >
                        <DatePicker
                          id="end_date"
                          value={field.state.value}
                          onChange={field.handleChange}
                          disabled={readOnly}
                          placeholder="Select date"
                          defaultMonth={startDateAsDate}
                          className="w-auto"
                        />
                      </InlineRow>
                      <FieldError errors={field.state.meta.errors} />
                    </div>
                  )}
                </form.Field>
              )
            }}
          </form.Subscribe>
        </InlineSection>

        <Separator />

        {/* Event Options */}
        <InlineSection title="Event Options">
          <form.Field name="allows_spouse">
            {(field) => (
              <InlineRow
                icon={<Heart className="h-4 w-4 text-muted-foreground" />}
                label="Spouse Registration"
                description="Attendees can register their spouse"
              >
                <Switch
                  id="allows_spouse"
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(checked)}
                  disabled={readOnly}
                />
              </InlineRow>
            )}
          </form.Field>

          <form.Field name="allows_children">
            {(field) => (
              <InlineRow
                icon={<Baby className="h-4 w-4 text-muted-foreground" />}
                label="Children Registration"
                description="Attendees can register their children"
              >
                <Switch
                  id="allows_children"
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(checked)}
                  disabled={readOnly}
                />
              </InlineRow>
            )}
          </form.Field>

          <form.Field name="allows_coupons">
            {(field) => (
              <InlineRow
                icon={<Ticket className="h-4 w-4 text-muted-foreground" />}
                label="Discount Coupons"
                description="Enable discount coupons for this popup"
              >
                <Switch
                  id="allows_coupons"
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(checked)}
                  disabled={readOnly}
                />
              </InlineRow>
            )}
          </form.Field>
        </InlineSection>

        <Separator />

        {/* Branding */}
        <InlineSection title="Branding">
          <form.Field name="icon_url">
            {(field) => (
              <div className="space-y-2 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Image className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">Icon</p>
                </div>
                <ImageUpload
                  value={field.state.value || null}
                  onChange={(url) => field.handleChange(url ?? "")}
                  disabled={readOnly}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="express_checkout_background">
            {(field) => (
              <div className="space-y-2 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Image className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">Checkout Background</p>
                </div>
                <ImageUpload
                  value={field.state.value || null}
                  onChange={(url) => field.handleChange(url ?? "")}
                  disabled={readOnly}
                />
              </div>
            )}
          </form.Field>
        </InlineSection>

        <Separator />

        {/* Links */}
        <InlineSection title="Links">
          <form.Field name="web_url">
            {(field) => (
              <InlineRow
                icon={<Globe className="h-4 w-4 text-muted-foreground" />}
                label="Website"
              >
                <Input
                  id="web_url"
                  type="url"
                  placeholder="https://example.com"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={readOnly}
                  className="max-w-xs text-sm"
                />
              </InlineRow>
            )}
          </form.Field>

          <form.Field name="blog_url">
            {(field) => (
              <InlineRow
                icon={<FileText className="h-4 w-4 text-muted-foreground" />}
                label="Blog"
              >
                <Input
                  id="blog_url"
                  type="url"
                  placeholder="https://example.com/blog"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={readOnly}
                  className="max-w-xs text-sm"
                />
              </InlineRow>
            )}
          </form.Field>

          <form.Field name="twitter_url">
            {(field) => (
              <InlineRow
                icon={<Twitter className="h-4 w-4 text-muted-foreground" />}
                label="Twitter"
              >
                <Input
                  id="twitter_url"
                  type="url"
                  placeholder="https://twitter.com/example"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={readOnly}
                  className="max-w-xs text-sm"
                />
              </InlineRow>
            )}
          </form.Field>
        </InlineSection>

        <Separator />

        {/* Integrations */}
        <InlineSection title="Integrations">
          <form.Field name="simplefi_api_key">
            {(field) => (
              <InlineRow
                icon={<Key className="h-4 w-4 text-muted-foreground" />}
                label="SimpleFi"
                description="Payment integration API key"
              >
                <Input
                  id="simplefi_api_key"
                  type="password"
                  placeholder="Enter API key"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={readOnly}
                  className="max-w-xs text-sm"
                />
              </InlineRow>
            )}
          </form.Field>
        </InlineSection>

        {/* Approval strategy + Reviewers (edit only) */}
        {isEdit && (
          <>
            <Separator />

            <ApprovalStrategyForm
              popupId={defaultValues!.id}
              readOnly={readOnly}
              variant="inline"
            />

            <Separator />

            <ConditionalReviewersManager
              popupId={defaultValues!.id}
              tenantId={defaultValues!.tenant_id}
              readOnly={readOnly}
              variant="inline"
            />
          </>
        )}

        <Separator />

        {/* Form Actions */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/popups" })}
          >
            {readOnly ? "Back" : "Cancel"}
          </Button>
          {!readOnly && (
            <LoadingButton type="submit" loading={isPending}>
              {isEdit ? "Save Changes" : "Create Popup"}
            </LoadingButton>
          )}
        </div>
      </form>

      {isEdit && !readOnly && (
        <div className="mx-auto max-w-2xl">
          <DangerZone
            description="Once you delete this popup, all associated products, groups, coupons, and attendee data will be permanently removed. This action cannot be undone."
            onDelete={() => deleteMutation.mutate()}
            isDeleting={deleteMutation.isPending}
            confirmText="Delete Popup"
            resourceName={defaultValues.name}
            variant="inline"
          />
        </div>
      )}

      <UnsavedChangesDialog blocker={blocker} />
    </div>
  )
}

function ConditionalReviewersManager({
  popupId,
  tenantId,
  readOnly,
  variant,
}: {
  popupId: string
  tenantId: string
  readOnly?: boolean
  variant?: "card" | "inline"
}) {
  const { data: strategy, isLoading } = useQuery({
    queryKey: ["approval-strategy", popupId],
    queryFn: () => ApprovalStrategiesService.getApprovalStrategy({ popupId }),
    retry: false,
  })

  if (isLoading) return null
  if (!strategy) return null
  if (strategy.strategy_type === "auto_accept") return null

  return (
    <ReviewersManager
      popupId={popupId}
      tenantId={tenantId}
      readOnly={readOnly}
      variant={variant}
    />
  )
}
